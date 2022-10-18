import { Directive, HostListener, EventEmitter, Output, HostBinding } from '@angular/core';
import { FileHandle } from '../../shared/interface/file-handle';
import { DomSanitizer } from '@angular/platform-browser';
@Directive({
    selector: '[appImageDrag]'
})
export class ImageDragDirective {
    // tslint:disable-next-line: no-output-rename
    @Output('files') files: EventEmitter<FileHandle[]> = new EventEmitter();
    constructor(private sanitizer: DomSanitizer) { }

    @HostListener('dragover', ['$event'])
    public onDragOver(evt: DragEvent): void {
        evt.preventDefault();
        evt.stopPropagation();
    }

    @HostListener('dragleave', ['$event'])
    public onDragLeave(evt: DragEvent): void {
        evt.preventDefault();
        evt.stopPropagation();
    }

    @HostListener('drop', ['$event'])
    public onDrop(evt: DragEvent): void {
        evt.preventDefault();
        evt.stopPropagation();
        const files: FileHandle[] = [];
        // tslint:disable-next-line: no-non-null-assertion
        for (let i = 0; i < evt.dataTransfer!.files.length; i++) {
            const file = evt.dataTransfer?.files[i];
            const url = this.sanitizer.bypassSecurityTrustUrl(window.URL.createObjectURL(file));
            files.push({
                file,
                url
            });
        }
        if (files.length > 0) {
            this.files.emit(files);
        }
    }
}
