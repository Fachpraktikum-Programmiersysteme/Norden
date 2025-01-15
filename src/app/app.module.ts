import {NgModule} from '@angular/core';
import {APP_BASE_HREF, PlatformLocation} from "@angular/common";
import {provideHttpClient, withInterceptorsFromDi} from "@angular/common/http";
import {ReactiveFormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

import {AppComponent} from './app.component';
import {DisplayComponent} from './components/display/display.component';
import {DeleteButtonComponent} from './components/button_delete-graph/delete-button.component';
import {ExampleFileComponent} from './components/example-file/example-file.component';
import {InfoButtonComponent} from "./components/button_display-info/info-button.component";
import {FooterComponent} from './components/footer/footer.component';
import {ModeButtonComponent} from './components/button_switch-display-mode/mode-button.component';
import {SaveButtonComponent} from './components/button_save-graph/save-button.component';
import {SubmitButtonComponent} from './components/button_submit-cut/submit-button.component';
import {TextInputComponent} from './components/text-input/text-input.component';
import {TracesButtonComponent} from "./components/button_display-traces/traces-button.component";
import {ToastComponent} from "./components/toast/toast.component";

@NgModule({
    declarations: [
        AppComponent,
        DisplayComponent,
        FooterComponent,
        ToastComponent
    ],bootstrap: [
        AppComponent
    ], imports: [
    BrowserAnimationsModule,
    BrowserModule,
    DeleteButtonComponent,
    ExampleFileComponent,
    InfoButtonComponent,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    ModeButtonComponent,
    ReactiveFormsModule,
    SaveButtonComponent,
    SubmitButtonComponent,
    TextInputComponent,
    TracesButtonComponent
], providers: [
        {
            provide: APP_BASE_HREF,
            useFactory: (s: PlatformLocation) => s.getBaseHrefFromDOM(),
            deps: [PlatformLocation]
        },
        provideHttpClient(withInterceptorsFromDi())
    ]
})
export class AppModule {
}
