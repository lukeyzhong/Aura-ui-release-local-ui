import { Component, OnDestroy, OnInit } from '@angular/core';
import { User } from '../../core/model/auth.model';
import { AuthService } from '../../core/service/auth.service';
import { Router } from '@angular/router';
import { NavLinkNode, NavLinkNodeFlat } from 'antra-ui';
import {
  GlobalModuleResult,
  GlobalSubModuleResult,
} from '../interface/module-navigation.interface';
import { ModuleNavigationService } from '../service/module-navigation.service';
import { Subscription } from 'rxjs';
import { ActiveUserInfoService } from '../../core/service/active-user-info.service';
import { environment } from '../../../environments/environment';
import { GlobalSearchApiService } from '../../shared/service/search/global-search-api.service';

@Component({
  selector: 'app-aura',
  templateUrl: './aura.component.html',
  styleUrls: ['./aura.component.scss'],
})
export class AuraComponent implements OnInit, OnDestroy {
  private subs: Subscription[] = [];
  isDashboardMenuClicked = true;

  moduleName = '';
  menuName: string[] = ['me'];

  user: User;

  isOpen = true;

  sideNavConfig: NavLinkNode[] = [];

  globalModuleResult: GlobalModuleResult[] = [];
  globalSubModuleResult: GlobalSubModuleResult[] = [];
  currentModule: GlobalModuleResult[] = [];
  moduleNamesList: string[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private moduleNavigationService: ModuleNavigationService,
    private activeUserInfo: ActiveUserInfoService,
    private globalSearchApiService: GlobalSearchApiService
  ) {
    this.user = this.authService.user as User;
    this.subs.push(
      this.authService.user$.subscribe((user) => {
        if (user) {
          this.user = user;
          this.activeUserInfo.setActiveUserInfo(this.user);
        }
      })
    );

    if (localStorage?.getItem('path')) {
      const localSPath = String(localStorage.getItem('path')).split('/');
      this.moduleName = localSPath[0];
      this.menuName[0] = localSPath[1];
    } else {
      localStorage.removeItem('path');
    }
  }

  ngOnInit(): void {
    this.subs.push(
      this.moduleNavigationService.getModules().subscribe(
        (res) => {
          this.globalModuleResult = res.result;
          for (const module of this.globalModuleResult) {
            this.moduleNamesList.push(module.name.toLowerCase());
          }

          const currentUrl = window.location.href;
          const urlParts = currentUrl?.split('/');
          this.moduleName = urlParts[5]?.toUpperCase();

          if (urlParts[5] === 'search') {
            this.router.navigateByUrl(currentUrl.split('/AuraUI')[1]);
            const name = currentUrl.split('/AuraUI')[1].split('searchText=')[1];
            const fullName = name.replace('%20', ' ').split(' ');
            this.menuName[0] =
              fullName[0] + ' ' + fullName[1].substring(0).toUpperCase();
          } else if (urlParts[6].includes('on-boarding')) {
            this.router.navigateByUrl(currentUrl.split('/AuraUI')[1]);

            this.menuName[0] = 'On Boarding';

            this.currentModule = this.globalModuleResult.filter(
              (module) => module.displayValue === this.moduleName
            );

            this.sideNavConfig = [];
            this.sideNavConfig = this.fillLeftSideNavBar(this.moduleName);
            this.moduleName = this.moduleName?.toUpperCase();
          } else if (urlParts[6].includes('hr-verify')) {
            this.router.navigateByUrl(currentUrl.split('/AuraUI')[1]);

            this.menuName[0] = 'Hr Verify';

            this.currentModule = this.globalModuleResult.filter(
              (module) => module.displayValue === this.moduleName
            );

            this.sideNavConfig = [];
            this.sideNavConfig = this.fillLeftSideNavBar(this.moduleName);
            this.moduleName = this.moduleName?.toUpperCase();
          } else {
            if (urlParts[6].includes('-')) {
              this.menuName[0] =
                urlParts[6].split('-')[0] +
                ' ' +
                urlParts[6].split('-')[1].substring(0).toUpperCase();
            } else {
              this.menuName[0] = urlParts[6];
            }
            this.goToHome(`${this.moduleName}/${this.menuName[0]}`);
          }
        },
        (err) => {
          console.warn(err);
        }
      )
    );

    this.globalSearchApiService?.getPath().subscribe((pathObj) => {
      if (pathObj?.path) {
        this.moduleName = pathObj?.path.split('/')[0];
        this.menuName[0] = pathObj?.path.split('/')[1];
      }
    });
    this.sideNavConfig = this.moduleNavigationService.sideNavConfig;
  }

  goToHome(menuName?: string | undefined): void {
    this.menuName[0] = menuName === undefined ? 'me' : menuName?.split('/')[1];
    this.moduleName = String(menuName?.split('/')[0])?.toUpperCase();

    if (this.menuName[0] === 'me') {
      this.sideNavConfig = this.moduleNavigationService.resetSideNavConfig();
      this.router.navigate([
        `/aura/${this.moduleName.toLowerCase()}/${this.menuName[0].toLowerCase()}`,
      ]);
    } else if (this.moduleNamesList.includes(this.moduleName.toLowerCase())) {
      this.loadLeftNavigationMenuItems(this.moduleName, this.menuName[0]);
    } else {
      this.router.navigateByUrl(window.location.href.split('/AuraUI')[1]);
    }
  }

  editProfile(): void {}

  logOut(): void {
    this.subs.push(
      this.authService
        .logOutFromDB(localStorage.getItem('jwt_token') as string)
        .subscribe(
          (res) => {
            if (res.errorCode === 0) {
              this.authService.logOut();
            }
          },
          (error) => {
            this.authService.logOut();
          }
        )
    );
  }

  getClickEventFromSideNav(event: NavLinkNodeFlat): void {
    if (event.url) {
      this.menuName = event.url.replace('-', ' ').split('/').slice(3);

      if (this.menuName[0] === 'me') {
        this.globalSearchApiService?.sendPath('Home/Me');
        this.router.navigate([event.url]);
      } else {
        const urlParts = event.url.substring(6).split('/');
        const updatedUrlParts = urlParts[0].toUpperCase() + '/' + urlParts[1];
        this.globalSearchApiService?.sendPath(updatedUrlParts);
        this.router.navigate([event.url]);
      }
    }
  }

  toggleSideNav(): void {
    this.isOpen = !this.isOpen;
  }

  // load left navigation menu items
  loadLeftNavigationMenuItems(
    displayValue: string,
    menuName: string = ''
  ): void {
    this.currentModule = this.globalModuleResult.filter(
      (module) => module.displayValue === displayValue
    );

    this.sideNavConfig = [];
    this.sideNavConfig = this.fillLeftSideNavBar(displayValue);
    this.moduleName = displayValue?.toUpperCase();
    if (menuName === '') {
      this.menuName = ['Dashboard'];
    } else {
      this.menuName = [menuName];
    }
    if (
      this.currentModule.length > 0 &&
      this.currentModule[0]?.url?.toLowerCase()?.indexOf('webats') >= 0
    ) {
      window.location.href = environment.hostUrl + this.currentModule[0].url;
    } else {
      if (menuName !== undefined) {
        if (menuName.includes(' ')) {
          this.router.navigate([
            `/aura/${displayValue.toLowerCase()}/${menuName
              .replace(' ', '-')
              .toLowerCase()}`,
          ]);
        } else {
          this.router.navigate([
            `/aura/${displayValue.toLowerCase()}/${menuName.toLowerCase()}`,
          ]);
        }
      }
    }
  }

  // filling sidenavconfig
  fillLeftSideNavBar(displayValue: string): NavLinkNode[] {
    this.globalModuleResult.map((res) => {
      if (res.displayValue === displayValue) {
        this.globalSubModuleResult = res.menuItems;
      }
    });
    return this.moduleNavigationService.loadMenuItems(
      this.globalSubModuleResult
    );
  }

  // Unsubscribe when the component dies
  ngOnDestroy(): void {
    if (this.subs) {
      this.subs.map((sub) => {
        sub.unsubscribe();
      });
    }
  }
}
