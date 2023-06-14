import { Injectable } from '@angular/core';
import { DataService } from '../data/data-request.service';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscriber } from 'rxjs';
import { AppConfig } from 'src/app/app.config';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs/operators';
import { FormGroup } from '@angular/forms';
import { Router } from "@angular/router";
import { ToastMessageService } from "src/app/services/toast-message/toast-message.service";
import { SchemaService } from "src/app/services/data/schema.service";



@Injectable({
  providedIn: 'root'
})
export class GeneralService {
  baseUrl = this.config.getEnv('baseUrl');
  bffUrl = this.config.getEnv('bffUrl');
  translatedString: string;
  private _pendingRequestCount = new BehaviorSubject<any>({ count: 0 });
  private _pendingRequestCount$ = this._pendingRequestCount.asObservable();
  constructor(public dataService: DataService, 
    private http: HttpClient, private config: AppConfig, public translate: TranslateService, private readonly router: Router, private toastMessage:ToastMessageService, public schemaService: SchemaService) {
  }

  postData(apiUrl, data, isBFF = false) {
    var url;
    if (apiUrl.indexOf('http') > -1) {
      url = apiUrl
    } else {
      url = isBFF ? `${this.bffUrl}${apiUrl}` : apiUrl.charAt(0) === '/' ? `${this.baseUrl}${apiUrl}` : `${this.baseUrl}/${apiUrl}`
    }

    const req = {
      url: url,
      data: data
    };

    return this.dataService.post(req);
  }

  getDocument(url: string): Observable<any> {
    return this.dataService.getDocument(url);
  }
 

  getData(apiUrl, outside: boolean = false) {
    var url;
    if (outside) {
      url = apiUrl;
    }
    else {
      url = `${this.baseUrl}/${apiUrl}`;
    }
    url.replace('//', '/');
    const req = {
      url: url
    };
    return this.dataService.get(req);
  }

  getPrefillData(apiUrl) {
    var url = apiUrl;
    let headers = new HttpHeaders();
    url.replace('//', '/');
    const req = {
      url: url,
      headers: headers
    };

    return this.dataService.get(req);
  }

  postPrefillData(apiUrl, data) {
    apiUrl.replace('//', '/');
    const req = {
      url: apiUrl,
      data: data
    };

    return this.dataService.post(req);
  }

  putData(apiUrl, id, data) {
    var url;
    if (apiUrl.charAt(0) == '/') {
      url = `${this.baseUrl}${apiUrl}/${id}`
    }
    else {
      url = `${this.baseUrl}/${apiUrl}/${id}`;
    }
    const req = {
      url: url,
      data: data
    };
    return this.dataService.put(req);
  }

  // Configurations
  getConfigs() {
    let url = "./assets/config/config.json";
    const req = {
      url: url
    };

    return this.dataService.get(req);
  }

  updateclaims(apiUrl, data) {
    let url = `${this.baseUrl}${apiUrl}`;
    const req = {
      url: url,
      data: data
    };
    return this.dataService.put(req);
  }

  translateString(constantStr){
    this.translate.get(constantStr).subscribe((val)=>{
       this.translatedString = val;
    });
    return this.translatedString;
  }

  attestationReq(apiUrl, data) {
    let url = `${this.baseUrl}${apiUrl}`;
    const req = {
      url: url,
      data: data
    };
    return this.dataService.put(req);
  }


  openPDF(url){
    url = `${this.baseUrl}` + '/' + `${url}`;

    let requestOptions = { responseType: 'blob' as 'blob' };
    // post or get depending on your requirement
    this.http.get(url, requestOptions).pipe(map((data: any) => {

        let blob = new Blob([data], {
            type: 'application/pdf' // must match the Accept type
            // type: 'application/octet-stream' // for excel 
        });
        var link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);

        window.open(link.href, '_blank')
       // link.download =  'temp.pdf';
       // link.click();
       // window.URL.revokeObjectURL(link.href);

    })).subscribe((result: any) => {
    });
  }

  getPendingRequestCount() {
    return this._pendingRequestCount$;
  }
  
  setLanguage(langKey: string) {
    localStorage.setItem('setLanguage', langKey);
    this.translate.use(langKey);
  }


  postStudentData(apiUrl, data) {
    const req = {
      url: `${this.baseUrl}/v1/sso/studentDetailV2`,
      data: data
    };
}

submitForm(formDetails, payload) {
  
  var form = formDetails['form'];
  let isFormSubmitted = formDetails['isFormSubmitted'];
  var api = formDetails['api'];

  if (form.invalid) {
    // return;
  }
  isFormSubmitted = true;

  // this.router.navigate(['/form/instructor-signup']);
  this.postData(api, payload, true).subscribe(

    (res: any) => {
      isFormSubmitted = false;
      this.router.navigate(["/form/udise-link"]);
      if (res?.status) {
        if (res?.response?.data) {
          localStorage.setItem(
            "instituteDetails",
            JSON.stringify(res.response.data)
          );
          this.router.navigate(["/form/instructor-signup"]);
        }
      } else {
        this.toastMessage.error(
          "",
          this.translateString(
            "INVALID_SCHOOL_UDISE_OR_PASSWORD"
          )
        );
      }
    },
    (error) => {
      isFormSubmitted = false;
      console.error(error);
      this.toastMessage.error(
        "",
        this.translateString(
          "INVALID_SCHOOL_UDISE_OR_PASSWORD"
        )
      );
    }
  );
}




}

