import {NgModule} from '@angular/core';
import {APP_BASE_HREF, PlatformLocation} from "@angular/common";
import {AppComponent} from './app.component';
import {provideHttpClient, withInterceptorsFromDi} from "@angular/common/http";
import {ReactiveFormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {ToastComponent} from './components/toast/toast.component';
import {ExampleFileComponent} from './components/example-file/example-file.component';
import {ExampleButtonComponent} from "./components/example-button/example-button.component";
import {DisplayComponent} from './components/display/display.component';
import {DeleteButtonComponent} from './components/button_delete-graph/delete-button.component';
import {FooterComponent} from './components/footer/footer.component';
import {SaveButtonComponent} from './components/button_save-graph/save-button.component';
import {TextInputComponent} from './components/text-input/text-input.component';

@NgModule({
    declarations: [
        AppComponent,
        DisplayComponent,
        FooterComponent,
        ToastComponent,
    ], bootstrap: [
        AppComponent
    ], imports: [
        BrowserAnimationsModule,
        BrowserModule,
        DeleteButtonComponent,
        ExampleButtonComponent,
        ExampleFileComponent,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatIconModule,
        ReactiveFormsModule,
        SaveButtonComponent,
        TextInputComponent,
        ExampleFileComponent,
        ExampleButtonComponent
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
