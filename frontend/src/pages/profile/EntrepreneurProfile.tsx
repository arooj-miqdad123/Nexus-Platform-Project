import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MessageCircle, Users, Calendar, Building2, MapPin, UserCircle, FileText, DollarSign, Send, X, Save } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { findUserById } from '../../data/users';
import { createCollaborationRequest, getRequestsFromInvestor } from '../../data/collaborationRequests';
import { Entrepreneur } from '../../types';

export const EntrepreneurProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user: currentUser, updateProfile } = useAuth();

    const [entrepreneur, setEntrepreneur] = useState<Entrepreneur | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [hasRequestedCollaboration, setHasRequestedCollaboration] = useState<boolean>(false);
    const [requestLoading, setRequestLoading] = useState<boolean>(false);

    // ✅ EDIT MODAL STATE
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        bio: '',
        startupName: '',
        industry: '',
        location: '',
        fundingNeeded: '',
        pitchSummary: '',
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setLoading(true);

                const isSelf =
                    currentUser?.id === id ||
                    String(currentUser?.id) === id;

                if (isSelf && currentUser) {
                    // Static data se sirf extra fields lo (avatarUrl, startupName etc.)
                    const localData = findUserById(id || '') as Entrepreneur | null;
                    const merged: Entrepreneur = {
                        ...(localData || {}),
                        ...currentUser,
                        // ✅ currentUser.name hamesha override karo — yahi registered naam hai
                        name: currentUser.name || (localData?.name ?? ''),
                        role: 'entrepreneur',
                    } as Entrepreneur;

                    setEntrepreneur(merged);
                    setEditForm({
                        name: currentUser.name || '',  // registered naam
                        bio: currentUser.bio || merged.bio || '',
                        startupName: (merged as Entrepreneur).startupName || '',
                        industry: (merged as Entrepreneur).industry || '',
                        location: (merged as Entrepreneur).location || '',
                        fundingNeeded: (merged as Entrepreneur).fundingNeeded || '',
                        pitchSummary: (merged as Entrepreneur).pitchSummary || '',
                    });
                } else {
                    const data = findUserById(id || '') as Entrepreneur | null;
                    setEntrepreneur(data);
                }

                const isInvestor = currentUser?.role === 'investor';
                if (isInvestor && currentUser && id) {
                    const requests = getRequestsFromInvestor(currentUser.id);
                    const alreadyRequested = requests.some(req => req.entrepreneurId === id);
                    setHasRequestedCollaboration(alreadyRequested);
                }
            } catch (error) {
                console.error("Error fetching entrepreneur profile:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProfileData();
    }, [id, currentUser]);

    const handleSendRequest = async () => {
        if (currentUser?.role === 'investor' && currentUser && id && entrepreneur) {
            try {
                setRequestLoading(true);
                createCollaborationRequest(currentUser.id, id,
                    `I'm interested in learning more about ${entrepreneur.startupName} and would like to explore potential investment opportunities.`);
                setHasRequestedCollaboration(true);
            } catch (error) {
                console.error("Error sending collaboration request:", error);
            } finally {
                setRequestLoading(false);
            }
        }
    };

    // ✅ PROFILE SAVE HANDLER
    const handleSaveProfile = async () => {
        if (!currentUser) return;
        setIsSaving(true);
        try {
            await updateProfile(currentUser.id, editForm);
            setEntrepreneur(prev => prev ? { ...prev, ...editForm } : prev);
            setShowEditModal(false);
        } catch (error) {
            console.error('Save failed:', error);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading profile...</span>
            </div>
        );
    }

    if (!entrepreneur || entrepreneur.role !== 'entrepreneur') {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900">Entrepreneur not found</h2>
                <p className="text-gray-600 mt-2">The entrepreneur profile you're looking for doesn't exist.</p>
                <Link to="/dashboard/investor">
                    <Button variant="outline" className="mt-4">Back to Dashboard</Button>
                </Link>
            </div>
        );
    }

    const isCurrentUser = currentUser?.id === entrepreneur.id || String(currentUser?.id) === String(entrepreneur.id);
    const isInvestor = currentUser?.role === 'investor';

    return (
        <div className="space-y-6 animate-fade-in">
            {/* ✅ EDIT PROFILE MODAL */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-xl font-bold text-gray-900">Edit Your Portfolio</h2>
                            <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input type="text" value={editForm.name}
                                    onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Startup Name</label>
                                <input type="text" value={editForm.startupName}
                                    onChange={e => setEditForm(f => ({ ...f, startupName: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                                <input type="text" value={editForm.industry}
                                    onChange={e => setEditForm(f => ({ ...f, industry: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                <input type="text" value={editForm.location}
                                    onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Funding Needed</label>
                                <input type="text" value={editForm.fundingNeeded}
                                    onChange={e => setEditForm(f => ({ ...f, fundingNeeded: e.target.value }))}
                                    placeholder="e.g. $500K"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                                <textarea rows={3} value={editForm.bio}
                                    onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pitch Summary</label>
                                <textarea rows={4} value={editForm.pitchSummary}
                                    onChange={e => setEditForm(f => ({ ...f, pitchSummary: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                        </div>
                        <div className="flex gap-3 p-6 border-t">
                            <Button variant="outline" fullWidth onClick={() => setShowEditModal(false)}>Cancel</Button>
                            <Button fullWidth isLoading={isSaving} leftIcon={<Save size={16} />} onClick={handleSaveProfile}>
                                Save Portfolio
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Header */}
            <Card>
                <CardBody className="sm:flex sm:items-start sm:justify-between p-6">
                    <div className="sm:flex sm:space-x-6">
                        <Avatar src={entrepreneur.avatarUrl} alt={entrepreneur.name} size="xl"
                            status={entrepreneur.isOnline ? 'online' : 'offline'} className="mx-auto sm:mx-0" />
                        <div className="mt-4 sm:mt-0 text-center sm:text-left">
                            <h1 className="text-2xl font-bold text-gray-900">{entrepreneur.name}</h1>
                            <p className="text-gray-600 flex items-center justify-center sm:justify-start mt-1">
                                <Building2 size={16} className="mr-1" />
                                Founder at {entrepreneur.startupName}
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-3">
                                <Badge variant="primary">{entrepreneur.industry}</Badge>
                                <Badge variant="gray">
                                    <MapPin size={14} className="mr-1" />{entrepreneur.location}
                                </Badge>
                                <Badge variant="accent">
                                    <Calendar size={14} className="mr-1" />Founded {entrepreneur.foundedYear}
                                </Badge>
                                <Badge variant="secondary">
                                    <Users size={14} className="mr-1" />{entrepreneur.teamSize} team members
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 sm:mt-0 flex flex-col sm:flex-row gap-2 justify-center sm:justify-end">
                        {!isCurrentUser && (
                            <>
                                <Link to={`/chat/${entrepreneur.id}`}>
                                    <Button variant="outline" leftIcon={<MessageCircle size={18} />}>Message</Button>
                                </Link>
                                {isInvestor && (
                                    <Button leftIcon={<Send size={18} />}
                                        disabled={hasRequestedCollaboration || requestLoading}
                                        onClick={handleSendRequest}>
                                        {requestLoading ? 'Sending...' : hasRequestedCollaboration ? 'Request Sent' : 'Request Collaboration'}
                                    </Button>
                                )}
                            </>
                        )}
                        {/* ✅ APNA PORTFOLIO DEKHO AUR EDIT KARO */}
                        {isCurrentUser && (
                            <Button variant="outline" leftIcon={<UserCircle size={18} />}
                                onClick={() => setShowEditModal(true)}>
                                Edit My Portfolio
                            </Button>
                        )}
                    </div>
                </CardBody>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main content */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader><h2 className="text-lg font-medium text-gray-900">About</h2></CardHeader>
                        <CardBody><p className="text-gray-700">{entrepreneur.bio || 'No bio added yet.'}</p></CardBody>
                    </Card>

                    <Card>
                        <CardHeader><h2 className="text-lg font-medium text-gray-900">Startup Overview</h2></CardHeader>
                        <CardBody>
                            <div className="space-y-4">
                                {entrepreneur.pitchSummary && (
                                    <div>
                                        <h3 className="text-md font-medium text-gray-900">Pitch Summary</h3>
                                        <p className="text-gray-700 mt-1">{entrepreneur.pitchSummary}</p>
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-md font-medium text-gray-900">Market Opportunity</h3>
                                    <p className="text-gray-700 mt-1">
                                        The {entrepreneur.industry} market is experiencing significant growth. Our solution addresses key pain points in this expanding market.
                                    </p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader className="flex justify-between items-center">
                            <h2 className="text-lg font-medium text-gray-900">Team</h2>
                            <span className="text-sm text-gray-500">{entrepreneur.teamSize} members</span>
                        </CardHeader>
                        <CardBody>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center p-3 border border-gray-200 rounded-md">
                                    <Avatar src={entrepreneur.avatarUrl} alt={entrepreneur.name} size="md" className="mr-3" />
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900">{entrepreneur.name}</h3>
                                        <p className="text-xs text-gray-500">Founder & CEO</p>
                                    </div>
                                </div>
                                <div className="flex items-center p-3 border border-gray-200 rounded-md">
                                    <Avatar src="https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg" alt="Team Member" size="md" className="mr-3" />
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900">Alex Johnson</h3>
                                        <p className="text-xs text-gray-500">CTO</p>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader><h2 className="text-lg font-medium text-gray-900">Funding</h2></CardHeader>
                        <CardBody>
                            <div className="space-y-4">
                                <div>
                                    <span className="text-sm text-gray-500">Funding Needed</span>
                                    <div className="flex items-center mt-1">
                                        <DollarSign size={18} className="text-green-600 mr-1" />
                                        <p className="text-lg font-semibold text-gray-900">{entrepreneur.fundingNeeded}</p>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">Valuation</span>
                                    <p className="text-md font-medium text-gray-900">$8M - $12M</p>
                                </div>
                                <div className="pt-3 border-t border-gray-100">
                                    <span className="text-sm text-gray-500">Funding Timeline</span>
                                    <div className="mt-2 space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-medium">Pre-seed</span>
                                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Completed</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-medium">Seed</span>
                                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Completed</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-medium">Series A</span>
                                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">In Progress</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader><h2 className="text-lg font-medium text-gray-900">Documents</h2></CardHeader>
                        <CardBody>
                            <div className="space-y-3">
                                {['Pitch Deck', 'Business Plan', 'Financial Projections'].map((doc) => (
                                    <div key={doc} className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                                        <div className="p-2 bg-blue-50 rounded-md mr-3">
                                            <FileText size={18} className="text-blue-700" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-sm font-medium text-gray-900">{doc}</h3>
                                            <p className="text-xs text-gray-500">Available in Documents section</p>
                                        </div>
                                        <Link to="/documents">
                                            <Button variant="outline" size="sm">View</Button>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                            {!isCurrentUser && isInvestor && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <p className="text-sm text-gray-500">
                                        Request access to detailed documents by sending a collaboration request.
                                    </p>
                                    <Button className="mt-3 w-full"
                                        disabled={hasRequestedCollaboration || requestLoading}
                                        onClick={handleSendRequest}>
                                        {requestLoading ? 'Sending...' : hasRequestedCollaboration ? 'Request Sent' : 'Request Collaboration'}
                                    </Button>
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
};