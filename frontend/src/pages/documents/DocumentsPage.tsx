import React, { useState, useEffect, useRef } from 'react';
import { FileText, Upload, Download, Trash2, Share2, Eye } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { getMyDocuments, uploadDocument } from '../../api';

interface DocumentItem {
    id?: number | string;
    _id?: number | string;
    title?: string;
    fileName?: string;
    name?: string;
    shared?: boolean;
    type?: string;
    size?: string;
    lastModified?: string;
}

interface GetDocumentsResponse {
    data?: DocumentItem[];
    [key: string]: unknown;
}

export const DocumentsPage: React.FC = () => {
    const [documents, setDocuments] = useState<DocumentItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchDocs = async () => {
        try {
            const res = await getMyDocuments() as GetDocumentsResponse;

            if (res && Array.isArray(res.data)) {
                setDocuments(res.data);
            } else if (Array.isArray(res)) {
                setDocuments(res as DocumentItem[]);
            } else {
                setDocuments([]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDocs();
    }, []);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        try {
            await uploadDocument(file, file.name, '');
            fetchDocs();
        } catch (err) {
            alert((err as Error).message);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
                    <p className="text-gray-600">Manage your startup's important files</p>
                </div>

                <div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleUpload}
                        className="hidden"
                    />
                    <Button
                        leftIcon={<Upload size={18} />}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                    >
                        {isUploading ? 'Uploading...' : 'Upload Document'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Storage info */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <h2 className="text-lg font-medium text-gray-900">Storage</h2>
                    </CardHeader>
                    <CardBody className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Used</span>
                                <span className="font-medium text-gray-900">12.5 GB</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full">
                                <div className="h-2 bg-primary-600 rounded-full" style={{ width: '65%' }}></div>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Available</span>
                                <span className="font-medium text-gray-900">7.5 GB</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <h3 className="text-sm font-medium text-gray-900 mb-2">Quick Access</h3>
                            <div className="space-y-2">
                                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">Recent Files</button>
                                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">Shared with Me</button>
                                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">Starred</button>
                                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">Trash</button>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Document list */}
                <div className="lg:col-span-3">
                    <Card>
                        <CardHeader className="flex justify-between items-center">
                            <h2 className="text-lg font-medium text-gray-900">All Documents</h2>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm">Sort by</Button>
                                <Button variant="outline" size="sm">Filter</Button>
                            </div>
                        </CardHeader>
                        <CardBody>
                            {isLoading ? (
                                <div className="text-center py-8 text-gray-500">Loading documents...</div>
                            ) : documents.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">No documents found.</div>
                            ) : (
                                <div className="space-y-2">
                                    {documents.map((doc) => (
                                        <div
                                            key={doc.id || doc._id}
                                            className="flex items-center p-4 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                                        >
                                            <div className="p-2 bg-primary-50 rounded-lg mr-4">
                                                <FileText size={24} className="text-primary-600" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-sm font-medium text-gray-900 truncate">
                                                        {doc.title || doc.fileName || doc.name}
                                                    </h3>
                                                    {doc.shared && <Badge size="sm">Shared</Badge>}
                                                </div>

                                                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                                    <span>{doc.type || 'Unknown'}</span>
                                                    <span>{doc.size || '0 KB'}</span>
                                                    <span>Modified {doc.lastModified || 'N/A'}</span>
                                                </div>
                                            </div>

                                            {/* Action Buttons Section */}
                                            <div className="flex items-center gap-2 ml-4">

                                                {/* ✅ FIXED: Click karne par yeh seedha New Tab (`_blank`) mein file open karega */}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="p-2"
                                                    aria-label="View"
                                                    onClick={() => {
                                                        const docId = doc.id || doc._id;
                                                        window.open(`http://localhost:5243/api/document/${docId}/download`, '_blank');
                                                    }}
                                                >
                                                    <Eye size={18} />
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="p-2"
                                                    aria-label="Download"
                                                    onClick={() => {
                                                        const docId = doc.id || doc._id;
                                                        window.open(`http://localhost:5243/api/document/${docId}/download`, '_blank');
                                                    }}
                                                >
                                                    <Download size={18} />
                                                </Button>

                                                <Button variant="ghost" size="sm" className="p-2" aria-label="Share">
                                                    <Share2 size={18} />
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="p-2 text-error-600 hover:text-error-700"
                                                    aria-label="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
};