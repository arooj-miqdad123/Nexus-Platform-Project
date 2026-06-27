import React, { useState, useEffect, useRef } from 'react';
import { FileText, Upload, Download, Trash2, Eye, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';

interface DocumentItem {
    id: string;
    title: string;
    type: string;
    size: string;
    lastModified: string;
    isStatic?: boolean;
    fileData?: string; // base64 for local files
    fileUrl?: string;
    uploadedBy?: string;
}

// Load documents from LocalStorage
const loadLocalDocs = (): DocumentItem[] => {
    try {
        const saved = localStorage.getItem('nexus_documents');
        return saved ? JSON.parse(saved) : [];
    } catch { return []; }
};

const saveLocalDocs = (docs: DocumentItem[]) => {
    try {
        // Save only metadata to save space, removing fileData for non-static files
        const toSave = docs.filter(d => !d.isStatic).map(d => ({ ...d, fileData: undefined }));
        localStorage.setItem('nexus_documents', JSON.stringify(toSave));
    } catch { console.error('Save failed'); }
};

const STATIC_DOCUMENTS: DocumentItem[] = [
    { id: 'static-1', title: 'Pitch Deck Template', lastModified: '2 months ago', type: 'PDF', size: '4.2 MB', isStatic: true },
    { id: 'static-2', title: 'Business Plan Template', lastModified: '1 month ago', type: 'DOCX', size: '1.8 MB', isStatic: true },
    { id: 'static-3', title: 'Financial Projections Template', lastModified: '2 weeks ago', type: 'XLSX', size: '2.5 MB', isStatic: true },
];

const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export const DocumentsPage: React.FC = () => {
    const { user } = useAuth();
    const [documents, setDocuments] = useState<DocumentItem[]>([...STATIC_DOCUMENTS]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
    const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load saved docs on mount
    useEffect(() => {
        const localDocs = loadLocalDocs();
        setDocuments([...STATIC_DOCUMENTS, ...localDocs]);
    }, []);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        setUploadSuccess(null);

        try {
            // Convert file to base64 for local storage
            const reader = new FileReader();
            reader.onload = () => {
                const fileData = reader.result as string;
                const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';

                const newDoc: DocumentItem = {
                    id: `doc-${Date.now()}`,
                    title: file.name.replace(/\.[^/.]+$/, ''),
                    type: ext,
                    size: formatFileSize(file.size),
                    lastModified: 'Just now',
                    fileData: fileData,
                    uploadedBy: user?.name || 'You',
                };

                setDocuments(prev => {
                    const updated = [...prev, newDoc];
                    saveLocalDocs(updated);
                    return updated;
                });

                setUploadSuccess(`"${newDoc.title}" successfully uploaded!`);
                setTimeout(() => setUploadSuccess(null), 4000);
                setIsUploading(false);
            };
            reader.onerror = () => {
                alert('Error occurred while reading the file.');
                setIsUploading(false);
            };
            reader.readAsDataURL(file);
        } catch (err) {
            console.error(err);
            setIsUploading(false);
        }

        // Reset input so the same file can be uploaded again
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDelete = (docId: string) => {
        setDocuments(prev => {
            const updated = prev.filter(d => d.id !== docId);
            saveLocalDocs(updated);
            return updated;
        });
    };

    const handleDownload = (doc: DocumentItem) => {
        if (doc.isStatic) {
            alert(`"${doc.title}" is a template. You can only download your own uploaded files.`);
            return;
        }
        if (doc.fileData) {
            const link = document.createElement('a');
            link.href = doc.fileData;
            link.download = `${doc.title}.${doc.type.toLowerCase()}`;
            link.click();
        }
    };

    const handlePreview = (doc: DocumentItem) => {
        if (doc.isStatic) {
            alert(`"${doc.title}" is a template. Please upload your own document to preview.`);
            return;
        }
        setPreviewDoc(doc);
    };

    const userDocs = documents.filter(d => !d.isStatic);
    const totalSize = userDocs.length * 2.5; // Approximate

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Document Preview Modal */}
            {previewDoc && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-lg font-semibold text-gray-900">{previewDoc.title}</h3>
                            <button onClick={() => setPreviewDoc(null)}
                                className="text-gray-500 hover:text-gray-700 text-2xl font-bold">✕</button>
                        </div>
                        <div className="flex-1 overflow-auto p-4">
                            {previewDoc.fileData && previewDoc.type === 'PDF' ? (
                                <iframe src={previewDoc.fileData} className="w-full h-full min-h-96" title={previewDoc.title} />
                            ) : previewDoc.fileData && ['JPG', 'JPEG', 'PNG', 'GIF', 'WEBP'].includes(previewDoc.type) ? (
                                <img src={previewDoc.fileData} alt={previewDoc.title} className="max-w-full mx-auto" />
                            ) : (
                                <div className="text-center py-16">
                                    <FileText size={64} className="mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-600 font-medium">{previewDoc.title}.{previewDoc.type.toLowerCase()}</p>
                                    <p className="text-gray-400 text-sm mt-2">This file type cannot be previewed in the browser.</p>
                                    <Button className="mt-4" onClick={() => handleDownload(previewDoc)}
                                        leftIcon={<Download size={16} />}>
                                        Download File
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
                    <p className="text-gray-600">Manage your startup's important documents</p>
                </div>
                <div>
                    <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.txt" />
                    <Button leftIcon={<Upload size={18} />}
                        onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                        {isUploading ? 'Uploading...' : 'Upload Document'}
                    </Button>
                </div>
            </div>

            {/* Success Message */}
            {uploadSuccess && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                    <CheckCircle size={18} />
                    <span className="text-sm font-medium">{uploadSuccess}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Storage Stats */}
                <Card className="lg:col-span-1">
                    <CardHeader><h2 className="text-lg font-medium text-gray-900">Storage</h2></CardHeader>
                    <CardBody className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Used</span>
                                <span className="font-medium text-gray-900">{totalSize.toFixed(1)} MB</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full">
                                <div className="h-2 bg-blue-600 rounded-full transition-all"
                                    style={{ width: `${Math.min((totalSize / 100) * 100, 100)}%` }}></div>
                            </div>
                            <p className="text-xs text-gray-500">of 100 MB</p>
                        </div>

                        <div className="pt-4 border-t space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Total Files</span>
                                <span className="font-medium">{userDocs.length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Uploaded by you</span>
                                <span className="font-medium">{userDocs.length}</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t">
                            <p className="text-xs text-gray-500 font-medium mb-2">Supported formats:</p>
                            {['PDF', 'DOCX', 'XLSX', 'PPTX', 'JPG', 'PNG', 'TXT'].map(f => (
                                <span key={f} className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded mr-1 mb-1">{f}</span>
                            ))}
                        </div>
                    </CardBody>
                </Card>

                {/* Documents List */}
                <div className="lg:col-span-3">
                    <Card>
                        <CardHeader className="flex justify-between items-center">
                            <h2 className="text-lg font-medium text-gray-900">All Documents</h2>
                            <span className="text-sm text-gray-500">{documents.length} files</span>
                        </CardHeader>
                        <CardBody>
                            {documents.length === 0 ? (
                                <div className="text-center py-12">
                                    <FileText size={48} className="mx-auto text-gray-300 mb-3" />
                                    <p className="text-gray-500">No documents found.</p>
                                    <p className="text-gray-400 text-sm">Add your first document using the upload button.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {/* Templates Section */}
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Templates</p>
                                    {documents.filter(d => d.isStatic).map((doc) => (
                                        <div key={doc.id}
                                            className="flex items-center p-4 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100">
                                            <div className="p-2 bg-blue-50 rounded-lg mr-4">
                                                <FileText size={24} className="text-blue-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-sm font-medium text-gray-900 truncate">{doc.title}</h3>
                                                    <Badge size="sm" className="bg-gray-100 text-gray-600 border border-gray-200">Template</Badge>
                                                </div>
                                                <div className="flex gap-4 mt-1 text-xs text-gray-500">
                                                    <span>{doc.type}</span>
                                                    <span>{doc.size}</span>
                                                    <span>Updated {doc.lastModified}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 ml-4">
                                                <Button variant="outline" size="sm"
                                                    onClick={() => alert('Please upload your own document to use or download this template.')}>
                                                    Use Template
                                                </Button>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Uploaded Documents Section */}
                                    {userDocs.length > 0 && (
                                        <>
                                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-4 mb-2">Your Uploads</p>
                                            {userDocs.map((doc) => (
                                                <div key={doc.id}
                                                    className="flex items-center p-4 hover:bg-gray-50 rounded-lg transition-colors border border border-green-100 bg-green-50/30">
                                                    <div className="p-2 bg-green-50 rounded-lg mr-4">
                                                        <FileText size={24} className="text-green-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="text-sm font-medium text-gray-900 truncate">{doc.title}</h3>
                                                            <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">Uploaded</span>
                                                        </div>
                                                        <div className="flex gap-4 mt-1 text-xs text-gray-500">
                                                            <span>{doc.type}</span>
                                                            <span>{doc.size}</span>
                                                            <span>{doc.lastModified}</span>
                                                            {doc.uploadedBy && <span>by {doc.uploadedBy}</span>}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 ml-4">
                                                        <button onClick={() => handlePreview(doc)}
                                                            className="p-2 text-gray-500 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                                                            title="Preview">
                                                            <Eye size={18} />
                                                        </button>
                                                        <button onClick={() => handleDownload(doc)}
                                                            className="p-2 text-gray-500 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                                                            title="Download">
                                                            <Download size={18} />
                                                        </button>
                                                        <button onClick={() => handleDelete(doc.id)}
                                                            className="p-2 text-red-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                                                            title="Delete">
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    )}

                                    {/* Upload prompt if no user docs exist */}
                                    {userDocs.length === 0 && (
                                        <div className="mt-4 p-6 border-2 border-dashed border-gray-200 rounded-lg text-center">
                                            <Upload size={32} className="mx-auto text-gray-300 mb-2" />
                                            <p className="text-sm text-gray-500">No uploaded files. Use the "Upload Document" button above.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
};