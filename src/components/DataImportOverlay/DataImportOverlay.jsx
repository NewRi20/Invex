import React, { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import { useAuth } from '../../AuthProvider';

const DataImportOverlay = ({ isOpen, onClose, onUploadSuccess }) => {
    const { session } = useAuth();
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: '' }
    const inputRef = useRef(null);

    if (!isOpen) return null;

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const validateFile = (file) => {
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'application/vnd.ms-excel', // .xls
            'text/csv' // .csv
        ];
        // Allow check by extension as fallback
        const validExtensions = ['.csv', '.xlsx', '.xls'];
        const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();

        if (validTypes.includes(file.type) || validExtensions.includes(extension)) {
            return true;
        }
        return false;
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (validateFile(droppedFile)) {
                setFile(droppedFile);
                setStatus(null);
            } else {
                setStatus({ type: 'error', message: 'Invalid file type. Please upload a CSV or Excel file.' });
            }
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (validateFile(selectedFile)) {
                setFile(selectedFile);
                setStatus(null);
            } else {
                setStatus({ type: 'error', message: 'Invalid file type. Please upload a CSV or Excel file.' });
            }
        }
    };

    const onButtonClick = () => {
        inputRef.current.click();
    };

    const handleUpload = async () => {
        if (!file || !session) return;

        setUploading(true);
        setStatus(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${API_BASE_URL}/items/import`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                    // Do NOT set Content-Type here, browser sets it for FormData
                },
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                setStatus({ type: 'success', message: result.message || 'Items imported successfully!' });
                if(onUploadSuccess) onUploadSuccess();
                setTimeout(() => {
                    onClose();
                    setFile(null);
                    setStatus(null);
                }, 2000);
            } else {
                setStatus({ type: 'error', message: result.message || 'Upload failed.' });
            }
        } catch (error) {
            console.error('Upload error:', error);
            setStatus({ type: 'error', message: 'An error occurred during upload.' });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60" onClick={onClose}>
            <div
                className="relative flex w-[90%] max-w-[500px] flex-col gap-4 rounded-[var(--border-radius)] border border-white/10 bg-[color:var(--primary-bg)] p-8 text-white shadow-[0_4px_12px_rgba(0,0,0,0.25)]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-2 flex items-center justify-between">
                    <h3 className="m-0 text-2xl font-semibold">Import Items</h3>
                    <button className="cursor-pointer border-none bg-transparent text-gray-400 transition-colors hover:text-white" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div 
                    className={`cursor-pointer rounded-lg border-2 border-dashed p-10 text-center transition-colors ${
                        dragActive
                            ? 'border-[color:var(--secondary-bg)] bg-[color:rgba(var(--secondary-bg-rgb),0.1)]'
                            : 'border-gray-600 bg-white/[0.02]'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={onButtonClick}
                >
                    <input 
                        ref={inputRef}
                        type="file" 
                        accept=".csv, .xlsx, .xls"
                        onChange={handleChange}
                        style={{ display: 'none' }} 
                    />
                    
                    {!file ? (
                        <>
                            <Upload size={48} color="#9ca3af" />
                            <p className="my-2 text-gray-300">Drag & Drop your file here or click to browse</p>
                            <span className="text-sm text-gray-400">Supported formats: .csv, .xlsx</span>
                        </>
                    ) : (
                        <div>
                            <FileSpreadsheet size={48} color="#34d399" />
                            <p className="my-2 text-gray-200">{file.name}</p>
                            <span className="text-sm text-gray-400">{(file.size / 1024).toFixed(2)} KB</span>
                        </div>
                    )}
                </div>

                {status && (
                    <div
                        className={`mt-3 flex items-center rounded px-2.5 py-2 text-[0.9rem] ${
                            status.type === 'success'
                                ? 'border border-emerald-600 bg-emerald-500/20 text-emerald-400'
                                : 'border border-red-700 bg-red-500/20 text-red-400'
                        }`}
                    >
                        {status.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                        <span className="ml-1.5">{status.message}</span>
                    </div>
                )}

                <div className="mt-4 flex justify-end gap-3">
                    <button
                        className="cursor-pointer rounded border border-gray-600 bg-transparent px-4 py-2 text-white transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
                        onClick={onClose}
                        disabled={uploading}
                    >
                        Cancel
                    </button>
                    <button 
                        className="cursor-pointer rounded border-none bg-[color:var(--secondary-bg)] px-4 py-2 font-semibold text-black transition-opacity disabled:cursor-not-allowed disabled:opacity-50" 
                        onClick={handleUpload} 
                        disabled={!file || uploading}
                    >
                        {uploading ? 'Importing...' : 'Upload & Import'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DataImportOverlay;
