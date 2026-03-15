import React, { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import './DataImportOverlay.css';
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
        <div className="data-import-overlay" onClick={onClose}>
            <div className="data-import-modal" onClick={(e) => e.stopPropagation()}>
                <div className="data-import-header">
                    <h3>Import Items</h3>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div 
                    className={`drop-zone ${dragActive ? 'active' : ''}`}
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
                            <p>Drag & Drop your file here or click to browse</p>
                            <span className="file-types">Supported formats: .csv, .xlsx</span>
                        </>
                    ) : (
                        <div className="file-preview">
                            <FileSpreadsheet size={48} color="#34d399" />
                            <p>{file.name}</p>
                            <span className="file-types">{(file.size / 1024).toFixed(2)} KB</span>
                        </div>
                    )}
                </div>

                {status && (
                    <div className={`status-message ${status.type}`}>
                        {status.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                        <span>{status.message}</span>
                    </div>
                )}

                <div className="upload-actions">
                    <button className="cancel-btn" onClick={onClose} disabled={uploading}>Cancel</button>
                    <button 
                        className="upload-btn" 
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
