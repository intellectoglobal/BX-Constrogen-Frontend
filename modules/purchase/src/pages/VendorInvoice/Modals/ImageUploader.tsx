import React, { useRef } from "react";
import { Image } from "primereact/image";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { confirmDialog } from "primereact/confirmdialog";
import { base64Converter } from "@igblsln/store";

export interface ImageItem {
    key?: number; // existing images
    base64: string; // url or base64
    name: string;
    size: number;
}

interface ImageUploaderProps {
    images: ImageItem[];
    onImagesChange: (images: ImageItem[]) => void;
    accept?: string;
    multiple?: boolean;
    maxFileSize?: number;
    onError?: (error: string) => void;
    viewMode?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
    images,
    onImagesChange,
    accept = "image/*",
    multiple = true,
    maxFileSize,
    onError,
    viewMode = false,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isViewMode = viewMode;

    /* ---------- Select files ---------- */
    const handleFileChange = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        try {
            const files = Array.from(e.target.files || []);

            if (!files.length) return;

            const validFiles = maxFileSize
                ? files.filter((f) => f.size <= maxFileSize)
                : files;

            const converted: ImageItem[] = await Promise.all(
                validFiles.map(async (file) => ({
                    base64: (await base64Converter(file)) as string,
                    name: file.name,
                    size: file.size,
                }))
            );

            onImagesChange([...images, ...converted]);
            e.target.value = "";
        } catch {
            onError?.("Failed to process images");
        }
    };

    /* ---------- Delete image ---------- */
    const deleteImage = (item: ImageItem) => {
        confirmDialog({
            message: "Are you sure you want to delete this image?",
            header: "Confirmation",
            icon: "pi pi-exclamation-triangle",
            accept: () => {
                onImagesChange(
                    images.filter((img) =>
                        item.key !== undefined
                            ? img.key !== item.key
                            : img.base64 !== item.base64
                    )
                );
            },
        });
    };
    return (
        <div
            style={{
                border: "2px solid gray",
                margin: "10px auto",
                borderRadius: "4px",
            }}
        >
            {/* HEADER */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px",
                    borderBottom: "1px solid #ccc",
                }}
            >
                <span style={{ fontWeight: 600 }}>Invoices</span>
                {!isViewMode &&
                    <Button
                        type="button"
                        label="Upload"
                        icon="pi pi-plus"
                        className="p-button-warning"
                        onClick={(e) => {
                            fileInputRef.current?.click();
                            e.preventDefault();
                        }}
                    />
                }
            </div>

            {/* BODY */}
            <div style={{ padding: "10px" }}>
                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                />

                {images.length === 0 ? (
                    <div
                        style={{
                            textAlign: "center",
                            padding: "2rem",
                            color: "#777",
                        }}
                    >
                        No Invoices
                    </div>
                ) : (
                    <div className="grid">
                        {images.map((item, index) => (
                            <div key={index} className="col-12 md:col-4 lg:col-3">
                                <Card className="shadow-2" style={{ position: "relative" }}>
                                    <Image
                                        src={item.base64}
                                        alt={item.name}
                                        preview
                                        width="100%"
                                        height="200"
                                        style={{ objectFit: "cover" }}
                                    />

                                    <div className="pt-2">
                                        <div className="text-sm font-medium truncate">
                                            {item.name}
                                        </div>
                                        <div className="flex justify-content-between align-items-center">
                                            <span className="text-xs text-gray-600">
                                                {(item.size / 1024).toFixed(2)} KB
                                            </span>
                                            {!isViewMode &&
                                                <Button
                                                    type="button"
                                                    icon="pi pi-trash"
                                                    className="p-button-text p-button-danger"
                                                    onClick={(e) => {
                                                        deleteImage(item);
                                                        e.preventDefault();
                                                    }}
                                                />
                                            }
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

};

export default ImageUploader;
