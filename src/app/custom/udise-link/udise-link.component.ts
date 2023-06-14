import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { FormlyFieldConfig, FormlyFormOptions } from "@ngx-formly/core";
import { GeneralService } from "src/app/services/general/general.service";
import { ToastMessageService } from "src/app/services/toast-message/toast-message.service";
import { SchemaService } from "src/app/services/data/schema.service";
import { FormlyJsonschema } from "@ngx-formly/core/json-schema";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-udise-link",
  templateUrl: "./udise-link.component.html",
  styleUrls: ["./udise-link.component.scss"],
})
export class UdiseLinkComponent implements OnInit {
  model = {};
  options: FormlyFormOptions;
  fields: FormlyFieldConfig[];
  form: FormGroup;
  isFormSubmitted = false;
  udiseLinkForm = new FormGroup({
    udiseId: new FormControl(null, [Validators.required]),
    password: new FormControl(null, [Validators.required]),
  });
  formSchema: any;
  templatePath: any;

  constructor(
    private readonly generalService: GeneralService,
    private readonly toastMessage: ToastMessageService,
    private readonly router: Router,
    public schemaService: SchemaService,
    private formlyJsonschema: FormlyJsonschema,
    public translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.isFormSubmitted = false;
    this.getFormJSON();
    this.form = new FormGroup({});
    this.options = {};
  }

  get udiseLinkFormControl() {
    return this.udiseLinkForm.controls;
  }

  getFormJSON() {
    const selectedForm = "udise-link";
    this.schemaService.getFormJSON().subscribe(
      (FormSchemas) => {
        var filtered = FormSchemas.forms.filter((obj) => {
          return Object.keys(obj)[0] === selectedForm;
        });
        this.formSchema = filtered[0][selectedForm];
        this.formSchema.title = this.translate.instant(this.formSchema.title);

        Object.keys(this.formSchema.properties).forEach((key) => {
          if (this.formSchema.properties[key].title) {
            this.formSchema.properties[key].title = this.translate.instant(this.formSchema.properties[key].title);
          }
        });

        this.fields = [this.formlyJsonschema.toFieldConfig(this.formSchema)];

        this.templatePath = filtered[0][selectedForm]["template"];
      },
      (error) => {
        this.toastMessage.error(
          "error",
          "forms.json not found in src/assets/config/ - You can refer to examples folder to create the file"
        );
      }
    );
  }

  verifyUDISE() {
    var formDetails = [];
    formDetails['form'] = this.udiseLinkForm;
    formDetails['isFormSubmitted'] = this.isFormSubmitted;
    formDetails['api'] = this.formSchema.api;
    const payload = {
      requestbody: {
        udiseCode: this.model["udiseId"],
      },
      password: this.model["password"],
    };

    this.generalService.submitForm(formDetails,payload);
  }

 
}
