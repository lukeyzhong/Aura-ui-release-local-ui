import { Component, OnInit } from '@angular/core';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ActiveUserInfoService } from '../../../../../core/service/active-user-info.service';
import { CandidateOnboardingWorkflowService } from '../../../../../shared/service/candidate-workflow/candidate-onboarding-workflow.service';
import { MatNotificationService } from '../../../../../shared/service/mat-notification.service';
import { DocumentsService } from '../../../../../shared/service/documents/documents.service';
import { DomSanitizer } from '@angular/platform-browser';
import { CompensationInformationResult } from '../../../../../aura/hr/interface/dashboard/candidate-onboarding.interface';
import { CandidateOnboardingInformationResult } from '../../../../../shared/interface/candidate-onboarding-workflow.interface';

@Component({
  selector: 'app-candidate-onboarding-workflow',
  templateUrl: './candidate-onboarding-workflow.component.html',
  styleUrls: ['./candidate-onboarding-workflow.component.scss'],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false },
    },
  ],
})
export class CandidateOnboardingWorkflowComponent implements OnInit {
  isLinear = false;
  isLoading = false;

  employeeOnboardingId!: string;
  personalGroup!: FormGroup;
  emergencyGroup!: FormGroup;
  banksGroup!: FormGroup;
  taxGroup!: FormGroup;
  i9Group!: FormGroup;
  candOnboardDocGroup!: FormGroup;
  previewGroup!: FormGroup;
  msg = '';
  submitStatus = false;
  fileExt = ['jpg', 'jpeg', 'png', 'bmp'];
  candidateName!: string;
  imageUrl = './assets/svg/candidate-onboard/profile-pic.svg';
  personId!: string;
  profilePictureDocumentId!: string;
  zoom = false;
  empType!: string;
  empTypes = ['1099', 'Unpaid Intern'];
  hideTaxTab = true;
  compensationInfo!: CompensationInformationResult;
  candidateOnboardingInformationResult!: CandidateOnboardingInformationResult;

  // tslint:disable-next-line: no-any
  hrComments: any[] = [];
  hrCommentsMap = new Map<string, string>();

  keysPersonalInfo: string[] = [];
  keysIdentificationInfo: string[] = [];
  keysEducationInfo: string[] = [];
  keysContactsInfo: string[] = [];
  keysBanksPaychecksInfo: string[] = [];
  keysWorkEligibilityInfo: string[] = [];
  countKeysPersonalInfo!: number;
  countKeysIdentificationInfo!: number;
  countKeysEducationInfo!: number;
  countKeysContactsInfo!: number;
  countKeysBanksPaychecksInfo!: number;
  countKeysWorkEligibilityInfo!: number;

  commentValue!: string;
  commentKey = '';

  status = 'inactive';

  constructor(
    private router: Router,
    private domSanitizer: DomSanitizer,
    private activeUserInfo: ActiveUserInfoService,
    private documentsService: DocumentsService,
    private candidateOnboardingWorkflowService: CandidateOnboardingWorkflowService,
    private matNotificationService: MatNotificationService,
    private route: ActivatedRoute
  ) {
    this.route.params.subscribe((params) => {
      this.employeeOnboardingId = params.id;
    });
  }

  ngOnInit(): void {
    this.candidateName = this.activeUserInfo?.getActiveUserInfo()?.fullName;
    this.candidateOnboardingWorkflowService
      .getEmpType()
      .subscribe((empTypeObj) => {
        this.empType = empTypeObj.empType;
        this.hideTaxTab = this.empTypes.includes(this.empType) ? false : true;

        if (this.hideTaxTab === false) {
          this.candidateOnboardingWorkflowService.sendHideTaxDetails(true);
        } else {
          this.candidateOnboardingWorkflowService.sendHideTaxDetails(false);
        }
      });
    this.getComments();
  }
  getComments(): void {
    this.candidateOnboardingWorkflowService
      .getHRValidationCommentsByEmpOnboardingId(this.employeeOnboardingId)
      .subscribe(
        (data) => {
          if (data?.result && data?.result !== '{}') {
            this.hrComments = JSON.parse(data?.result);
            this.hrCommentsMap = new Map(Object?.entries(this.hrComments));
          }
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  getSubmitStatus(status: boolean): void {
    this.submitStatus = status;
  }
  goToCandidateDashboard(): void {
    this.router.navigate(['/aura/hr/dashboard']);
  }
  // tslint:disable-next-line: no-any
  setPersonId(profileInfoObj: any): void {
    this.personId = profileInfoObj?.personId;
    this.profilePictureDocumentId = profileInfoObj?.profileDocId;

    if (this.profilePictureDocumentId) {
      this.candidateOnboardingWorkflowService.sendProfilePicStatus(false);
      this.setProfilePicture(this.profilePictureDocumentId);
    } else {
      this.candidateOnboardingWorkflowService.sendProfilePicStatus(true);
    }
  }

  setProfilePicture(profilePicId: string): void {
    this.isLoading = true;
    this.documentsService.getDocument(profilePicId).subscribe(
      (data) => {
        if (data?.byteLength === 94) {
          this.imageUrl = './assets/svg/candidate-onboard/profile-pic.svg';
          this.candidateOnboardingWorkflowService.sendProfilePicStatus(true);
          this.isLoading = false;
        } else {
          const file = new Blob([data], { type: 'image/*' });
          const fileURL = URL.createObjectURL(file);
          this.imageUrl = this.domSanitizer.bypassSecurityTrustUrl(
            fileURL
          ) as string;
          this.candidateOnboardingWorkflowService.sendProfilePicStatus(false);
          this.isLoading = false;
        }
      },
      (err) => {
        console.warn(err);
        this.isLoading = false;
      }
    );
  }
  // tslint:disable-next-line: no-any
  uploadProfilePic(event: any): void {
    const file = event.target.files[0];
    if (this.fileExt.includes(file.name.split('.')[1])) {
      const reader = new FileReader();
      // tslint:disable-next-line: no-any
      reader.onload = (e: any) => {
        this.imageUrl = e.target.result;
      };
      reader.readAsDataURL(file);

      this.candidateOnboardingWorkflowService
        .saveProfilePhoto(
          file,
          file.name,
          this.personId,
          this.profilePictureDocumentId
        )
        .subscribe(
          (data) => {
            this.candidateOnboardingWorkflowService.sendProfilePicStatus(false);
            this.matNotificationService.success(
              ':: You have successfully uploaded your Profile Picture.'
            );
          },
          (err) => {
            console.warn(err);
            this.matNotificationService.showSnackBarMessage(
              'Oops! Request has failed',
              err
            );
          }
        );
    }
  }

  zoomIn(): void {
    this.zoom = true;
  }
  zoomOut(): void {
    this.zoom = false;
  }
  collapseOnboarding(): void {
    console.log('clicked');
  }

  // tslint:disable-next-line: no-any
  setSideBarNavStatus(status: any): void {
    this.status = status;
  }
}
