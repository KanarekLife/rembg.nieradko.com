import { useEffect, useState } from "react";
import { FileUpload, } from "@/FileUpload";
import { removeBackground, subscribeToProgress, getCapabilities } from 'rembg-webgpu';
import type { DeviceCapability, RemoveBackgroundResult } from 'rembg-webgpu';
import { BadgeWithDot } from "@/components/base/badges/badges";

type UploadedFile = {
    id: string;
    name: string;
    type: string;
    size: number;
    progress: number;
    error?: string;
    previewUrl?: string;
    result?: RemoveBackgroundResult & { fileName: string };
    fileObject?: File;
};

const uploadFile = async (file: File, onProgress: (progress: number, error?: string, result?: RemoveBackgroundResult & { fileName: string }, previewUrl?: string) => void) => {

    const url = URL.createObjectURL(file);

    let progress = 0;
    const interval = setInterval(() => {
        // cap at 99 so it never reaches 100
        progress = Math.min(progress + 1, 99);
        onProgress(progress, undefined, undefined, url);
        if (progress === 99) {
            clearInterval(interval);
        }
    }, 100);

    try {
        const result = await removeBackground(url);
        clearInterval(interval);

        onProgress(100, undefined, { ...result, fileName: file.name }, url);
    }
    catch (error) {
        clearInterval(interval);

        console.error('Error processing file:', error);
        onProgress(0, 'Tried to process the file but an error occurred. Check if the file is a correct image.', undefined, url);
    }
};


export const PhotoProcessor = (props: { isDisabled?: boolean }) => {
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [capability, setCapability] = useState<DeviceCapability | null>(null);

    // Check capabilities on mount
    useEffect(() => {
        getCapabilities().then(setCapability).catch(console.error);
        initializeModel();
    }, []);

    async function initializeModel() {
        try {
            // Subscribe to progress to track initialization
            const unsubscribe = subscribeToProgress((state) => {
                if (state.phase === 'ready') {
                    console.log('Model ready!');
                    unsubscribe();
                }
            });

            // Trigger initialization by calling removeBackground with a tiny dummy image
            const dummyImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
            await removeBackground(dummyImage);
            // Result is discarded, we just needed to trigger the model download
        } catch (error) {
            // Ignore errors from the dummy init
            console.log('Model initialization triggered');
        }
    }

    const handleDropFiles = (files: FileList) => {
        const newFiles = Array.from(files);
        const newFilesWithIds = newFiles.map((file) => ({
            id: Math.random().toString(),
            name: file.name,
            size: file.size,
            type: file.type,
            progress: 0,
            fileObject: file,
        }));

        setUploadedFiles([...newFilesWithIds.map(({ fileObject: _, ...file }) => file), ...uploadedFiles]);

        newFilesWithIds.forEach(({ id, fileObject }) => {
            uploadFile(fileObject, (progress, error, result, previewUrl) => {
                setUploadedFiles((prev) => prev.map((uploadedFile) => (uploadedFile.id === id ? { ...uploadedFile, progress, error, result, previewUrl } : uploadedFile)));
            });
        });
    };

    const handleDeleteFile = (id: string) => {
        const filesToDelete = uploadedFiles.filter((file) => file.id === id);
        filesToDelete.forEach((file) => {
            if (file.previewUrl) {
                URL.revokeObjectURL(file.previewUrl);
            }
            if (file.result?.blobUrl) {
                URL.revokeObjectURL(file.result.blobUrl);
            }
        });
        setUploadedFiles((prev) => prev.filter((file) => file.id !== id));
    };

    const handleRetryFile = (id: string) => {
        const file = uploadedFiles.find((file) => file.id === id);
        if (!file) return;

        uploadFile(new File([], file.name, { type: file.type }), (progress, error, result, previewUrl) => {
            setUploadedFiles((prev) => prev.map((uploadedFile) => (uploadedFile.id === id ? { ...uploadedFile, progress, error, result, previewUrl } : uploadedFile)));
        });
    };



    return (
        <div className="flex flex-col items-center gap-8">
            <div className="flex gap-2">
                <p className="text-tertiary">Detected engine:</p>
                {capability && <>
                    {capability?.device === 'webgpu' && capability.dtype === 'fp16' && <BadgeWithDot type="pill-color" color="orange">
                        🚀 WebGPU-FP16
                    </BadgeWithDot>}
                    {capability?.device === 'webgpu' && capability.dtype === 'fp32' && <BadgeWithDot type="pill-color" color="success">
                        ⚡ WebGPU-FP32
                    </BadgeWithDot>}
                    {capability?.device === 'wasm' && <BadgeWithDot type="pill-color" color="gray">
                        💻 WASM
                    </BadgeWithDot>}
                </>}
            </div>

            <FileUpload.Root>
                <FileUpload.DropZone isDisabled={props.isDisabled} onDropFiles={handleDropFiles} />

                <FileUpload.List>
                    {uploadedFiles.map((file) => (
                        <FileUpload.ListItemProgressBar
                            key={file.id}
                            {...file}
                            size={file.size}
                            onDelete={() => handleDeleteFile(file.id)}
                            onRetry={() => handleRetryFile(file.id)}
                        />
                    ))}
                </FileUpload.List>
            </FileUpload.Root>
        </div>
    );
};