import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import {
  AllUsersConfig,
  AllUsersResults,
} from '../../interface/all-users.interface';
import { UserManagementService } from '../../service/user-management.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/service/auth.service';
import { MatNotificationService } from '../../../../shared/service/mat-notification.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss'],
})
export class UserManagementComponent implements OnInit {
  // GET ALL USERS RESULT
  allUsersResults!: AllUsersResults[];

  allUsersConfig: AllUsersConfig = {
    isLoading: true,
    displayedColumns: [
      'position',
      'userName',
      'fullName',
      'emailAddress',
      'phoneNumber',
      'userType',
      'createdDateTime',
      'status',
    ],
    columns: [
      {
        headerDisplay: 'S.NO',
        key: 'position',
      },
      {
        headerDisplay: 'User ID',
        key: 'userName',
      },
      {
        headerDisplay: 'FirstName',
        key: 'firstName',
      },
      {
        headerDisplay: 'LastName',
        key: 'lastName',
      },
      {
        headerDisplay: 'User Name',
        key: 'fullName',
      },
      {
        headerDisplay: 'Email',
        key: 'emailAddress',
      },
      {
        headerDisplay: 'Phone Number',
        key: 'phoneNumber',
      },
      {
        headerDisplay: 'Type Of User',
        key: 'userType',
      },
      {
        headerDisplay: 'User Created Date',
        key: 'createdDateTime',
      },
      {
        headerDisplay: 'Status',
        key: 'status',
      },
    ],
    tableData: null,
    totalRows: 0,
  };
  // tslint:disable-next-line: no-any
  dataSource!: MatTableDataSource<any>;
  virtualCount = 0;
  pageSizeOptions = [10, 20, 30, 40, 50];
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  enableSearch = true;
  fetchType = 'All';
  pageNum = 1;
  pageSize = 10;

  searchText = '';
  filterByActive = 'All';
  filterByInactive = 'All';
  activeCount = 1;
  inActiveCount = 1;
  activeUser!: AllUsersResults;

  dialogConfirmRef!: MatDialogRef<ConfirmationDialogComponent>;

  constructor(
    private userManagementService: UserManagementService,
    private authService: AuthService,
    private matNotificationService: MatNotificationService,
    private router: Router,
    // tslint:disable-next-line: no-any
    protected dialogRef: MatDialogRef<any>,
    protected dialogConfirm: MatDialog
  ) {}

  ngOnInit(): void {
    this.getAllUsers();
  }

  getAllUsers(): void {
    this.allUsersConfig.isLoading = true;
    this.userManagementService.getAllUsers().subscribe(
      (data) => {
        this.allUsersConfig.isLoading = false;
        this.virtualCount = data?.result?.virtualCount;
        this.allUsersResults = data?.result?.results;
        this.setDataSource(this.allUsersResults);
      },
      (err) => {
        console.warn(err);
        this.allUsersConfig.isLoading = false;
      }
    );
  }
  setDataSource(allUsersResults: AllUsersResults[]): void {
    this.allUsersConfig.tableData = allUsersResults;
    this.allUsersListParser(this.allUsersConfig?.tableData);
    this.dataSource = new MatTableDataSource(this.allUsersConfig?.tableData);
  }

  allUsersListParser(allUsersResults: AllUsersResults[]): void {
    this.allUsersConfig.isLoading = false;
    this.allUsersConfig.totalRows = allUsersResults?.length;
    this.allUsersConfig.tableData = allUsersResults?.map((item, index) => {
      return {
        position: index + 1,
        fullName: item.firstName + ' ' + item.lastName,
        ...item,
      };
    });
  }

  pageChanged(event: PageEvent): void {
    const pageIndex = event.pageIndex + 1;
    const pageSize = event.pageSize;
    this.allUsersConfig.isLoading = true;
    this.userManagementService
      .getAllUsers(pageIndex, pageSize, this.searchText)
      .subscribe(
        (data) => {
          this.allUsersConfig.isLoading = false;
          this.virtualCount = data?.result?.virtualCount;
          this.allUsersResults = data?.result?.results;
          this.setDataSource(this.allUsersResults);
        },
        (err) => {
          console.warn(err);
          this.allUsersConfig.isLoading = false;
        }
      );
  }

  searchUser(searchText: string): void {
    this.searchText = '';
    this.searchText = searchText;
    this.refreshDataSource();
  }

  refreshDataSource(fetchType = 'All'): void {
    switch (fetchType) {
      case 'Active':
        this.filterByActive = fetchType;
        fetchType = 'Inactive';
        this.fetchType = fetchType;
        this.filterByInactive = 'All';

        break;
      case 'Inactive':
        this.filterByInactive = fetchType;
        this.filterByActive = 'All';
        fetchType = 'Active';
        this.fetchType = fetchType;
        break;

      case 'All':
        this.filterByActive = 'All';
        this.filterByInactive = 'All';
        break;
    }

    this.allUsersConfig.isLoading = true;
    this.userManagementService
      .getAllUsers(this.pageNum, this.pageSize, this.searchText, fetchType)
      .subscribe(
        (data) => {
          this.allUsersConfig.isLoading = false;
          this.allUsersResults = data?.result?.results;
          this.virtualCount = data?.result?.virtualCount;
          this.setDataSource(this.allUsersResults);
        },
        (err) => {
          console.warn(err);
          this.allUsersConfig.isLoading = false;
        }
      );
  }

  parsePhoneNumber(
    countryCode: string | undefined,
    phoneNumber: string
  ): string {
    let parsedPhoneNumber = '';
    if (phoneNumber) {
      if (phoneNumber === null) {
        parsedPhoneNumber = '-';
      } else {
        if (countryCode === null) {
          parsedPhoneNumber =
            '(' +
            phoneNumber.substr(0, 3) +
            ') ' +
            phoneNumber.substr(3, 3) +
            '-' +
            phoneNumber.substr(6, 4);
        } else {
          parsedPhoneNumber =
            '+' +
            countryCode +
            '(' +
            phoneNumber.substr(0, 3) +
            ') ' +
            phoneNumber.substr(3, 3) +
            '-' +
            phoneNumber.substr(6, 4);
        }
      }
    }
    return parsedPhoneNumber;
  }

  assignPermissions(userId: string): void {
    this.router.navigate(['/aura/admin/assign-permissions', userId]);
  }

  resetPassword(email: string): void {
    this.authService.sendResetPasswordLink(email).subscribe(
      (res) => {
        if (res?.errorCode === 0) {
          this.matNotificationService.success(
            ':: Password reset link has been sent to your email address.'
          );
        } else {
          this.matNotificationService.warn(':: Error: ' + res?.errorMessage);
        }
      },
      (error) => {
        this.matNotificationService.showSnackBarMessage(
          'Oops! Request has failed',
          'error'
        );
      }
    );
  }

  activateOrDeactiveUser(user: AllUsersResults): void {
    this.dialogConfirmRef = this.dialogConfirm.open(
      ConfirmationDialogComponent,
      {
        disableClose: false,
      }
    );
    const status = user?.status === 'Inactive' ? 'activate' : 'deactivate';

    this.dialogConfirmRef.componentInstance.confirmMessage = `Are you sure that you want to ${status} the user, ${
      user?.firstName + ' ' + user?.lastName
    }?`;

    this.dialogConfirmRef.afterClosed().subscribe((result) => {
      if (result) {
        switch (user?.status) {
          case 'Active':
            this.deactivateUser(user?.userId);
            break;

          case 'Inactive':
            this.activateUser(user?.userId);
            break;
        }
      }
    });
  }
  activateUser(userId: string): void {
    this.userManagementService.activateUser(userId).subscribe(
      (res) => {
        if (res?.errorCode === 0) {
          this.matNotificationService.success(
            ':: User Activated Successfully.'
          );
          if (this.fetchType !== 'All') {
            this.refreshDataSource('Inactive');
          } else {
            this.refreshDataSource('All');
          }
        } else {
          this.matNotificationService.warn(':: Error: ' + res?.errorMessage);
        }
      },
      (error) => {
        this.matNotificationService.showSnackBarMessage(
          'Oops! Request has failed',
          'error'
        );
      }
    );
  }
  deactivateUser(userId: string): void {
    this.userManagementService.deactivateUser(userId).subscribe(
      (res) => {
        if (res?.errorCode === 0) {
          this.matNotificationService.success(
            ':: User Deactivated Successfully.'
          );
          if (this.fetchType !== 'All') {
            this.refreshDataSource('Active');
          } else {
            this.refreshDataSource('All');
          }
        } else {
          this.matNotificationService.warn(':: Error: ' + res?.errorMessage);
        }
      },
      (error) => {
        this.matNotificationService.showSnackBarMessage(
          'Oops! Request has failed',
          'error'
        );
      }
    );
  }
}
