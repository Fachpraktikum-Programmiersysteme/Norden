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
import {BaseCaseButtonComponent} from './components/button_toggle-auto-basecase/basecase-button.component';
import {CheckButtonComponent} from './components/button_switch-checked-cut/check-button.component';
import {DisplayComponent} from './components/display/display.component';
import {DeleteButtonComponent} from './components/button_delete-graph/delete-button.component';
import {DisplayButtonComponent} from './components/button_switch-display-mode/display-button.component';
import {ExampleFileComponent} from './components/example-file/example-file.component';
import {InfoButtonComponent} from "./components/button_display-node-info/info-button.component";
import {EmbedderButtonComponent} from './components/button_toggle-spring-embedder/embedder-button.component';
import {FooterComponent} from './components/footer/footer.component';
import {LabelsButtonComponent} from './components/button_display-node-labels/labels-button.component';
import {SaveButtonComponent} from './components/button_save-graph/save-button.component';
import {SearchButtonComponent} from "./components/button_search-cut/search-button.component";
import {SkipButtonComponent} from "./components/button_toggle-delays/skip-button.component";
import {SubmitButtonComponent} from './components/button_submit-cut/submit-button.component';
import {SymbolsButtonComponent} from './components/button_display-node-symbols/symbols-button.component';
import {TextInputComponent} from './components/text-input/text-input.component';
import {TracesButtonComponent} from "./components/button_display-traces/traces-button.component";
import {ToastComponent} from "./components/toast/toast.component";
import {WeightsButtonComponent} from './components/button_display-arc-weights/weights-button.component';

@NgModule({
    declarations: [
        AppComponent,
        DisplayComponent,
        FooterComponent,
        ToastComponent
    ],bootstrap: [
        AppComponent
    ], imports: [
    BaseCaseButtonComponent,
    BrowserAnimationsModule,
    BrowserModule,
    CheckButtonComponent,
    DeleteButtonComponent,
    DisplayButtonComponent,
    EmbedderButtonComponent,
    ExampleFileComponent,
    InfoButtonComponent,
    LabelsButtonComponent,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule,
    SaveButtonComponent,
    SearchButtonComponent,
    SkipButtonComponent,
    SubmitButtonComponent,
    SymbolsButtonComponent,
    TextInputComponent,
    TracesButtonComponent,
    WeightsButtonComponent
], providers: [
        {
            provide: APP_BASE_HREF,
            useFactory: (s: PlatformLocation) => s.getBaseHrefFromDOM(),
            deps: [PlatformLocation]
        },
        provideHttpClient(withInterceptorsFromDi())
    ]
})
export class AppModule {}