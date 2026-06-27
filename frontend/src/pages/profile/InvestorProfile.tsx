import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MessageCircle, Building2, MapPin, UserCircle, BarChart3, Briefcase, X, Save } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { findUserById } from '../../data/users';
import { Investor } from '../../types';

export const InvestorProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user: currentUser, updateProfile } = useAuth();

    const [investor, setInvestor] = useState<Investor | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        bio: '',
        minimumInvestment: '',
        maximumInvestment: '',
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const loadProfileData = async () => {
            try {
                setLoading(true);
                const isSelf =
                    currentUser?.id === id ||
                    String(currentUser?.id) === id;

                if (isSelf) {
                    // Static data se sirf extra fields lo (investmentInterests, avatarUrl etc.)
                    const localUser = findUserById(id || '') as Investor | null;
                    const merged: Investor = {
                        ...(localUser || {}),
                        ...currentUser,
                        // ✅ currentUser.name hamesha override karo — yahi registered naam hai
                        name: currentUser?.name || (localUser?.name ?? ''),
                        role: 'investor',
                    } as Investor;
                    setInvestor(merged);
                    setEditForm({
                        name: currentUser?.name || '',  // registered naam
                        bio: currentUser?.bio || merged.bio || '',
                        minimumInvestment: merged.minimumInvestment || '$50K',
                        maximumInvestment: merged.maximumInvestment || '$500K',
                    });
                } else {
                    // Kisi aur ka profile
                    const localUser = findUserById(id || '') as Investor | null;
                    setInvestor(localUser);
                }
            } catch (error) {
                console.error("Error loading profile:", error);
            } finally {
                setLoading(false);
            }
        };

        loadProfileData();
    }, [id, currentUser]);

    const handleSaveProfile = async () => {
        if (!currentUser) return;
        setIsSaving(true);
        try {
            await updateProfile(currentUser.id, editForm);
            setInvestor(prev => prev ? { ...prev, ...editForm } : prev);
            setShowEditModal(false);
        } catch (error) {
            console.error('Save failed:', error);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return <div className="text-center py-12 text-gray-600 font-medium animate-pulse">Loading Portfolio...</div>;
    }

    if (!investor) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900">Profile not found</h2>
                <Link to="/dashboard/investor">
                    <Button variant="outline" className="mt-4">Back to Dashboard</Button>
                </Link>
            </div>
        );
    }

    const isCurrentUser = currentUser?.id === id || String(currentUser?.id) === id;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* EDIT MODAL */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-xl font-bold text-gray-900">Edit My Portfolio</h2>
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                                <textarea rows={3} value={editForm.bio}
                                    onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Investment</label>
                                    <input type="text" value={editForm.minimumInvestment}
                                        onChange={e => setEditForm(f => ({ ...f, minimumInvestment: e.target.value }))}
                                        placeholder="e.g. $50K"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Investment</label>
                                    <input type="text" value={editForm.maximumInvestment}
                                        onChange={e => setEditForm(f => ({ ...f, maximumInvestment: e.target.value }))}
                                        placeholder="e.g. $500K"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
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
                        <Avatar src={investor.avatarUrl} alt={investor.name} size="xl"
                            status={investor.isOnline ? 'online' : 'offline'} className="mx-auto sm:mx-0" />
                        <div className="mt-4 sm:mt-0 text-center sm:text-left">
                            <h1 className="text-2xl font-bold text-gray-900">{investor.name}</h1>
                            <p className="text-gray-600 flex items-center justify-center sm:justify-start mt-1">
                                <Building2 size={16} className="mr-1" />
                                Investor • {investor.totalInvestments || 0} investments
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-3">
                                <Badge variant="primary">
                                    <MapPin size={14} className="mr-1" />Investor
                                </Badge>
                                {investor.investmentStage?.map((stage, index) => (
                                    <Badge key={index} variant="secondary" size="sm">{stage}</Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 sm:mt-0 flex flex-col sm:flex-row gap-2 justify-center sm:justify-end">
                        {!isCurrentUser && (
                            <Link to={`/chat/${investor.id}`}>
                                <Button leftIcon={<MessageCircle size={18} />}>Message</Button>
                            </Link>
                        )}
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
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader><h2 className="text-lg font-medium text-gray-900">About</h2></CardHeader>
                        <CardBody>
                            <p className="text-gray-700">{investor.bio || 'No bio added yet. Click "Edit My Portfolio" to add one.'}</p>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader><h2 className="text-lg font-medium text-gray-900">Investment Interests</h2></CardHeader>
                        <CardBody>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-md font-medium text-gray-900">Industries</h3>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {investor.investmentInterests?.length ? investor.investmentInterests.map((interest, index) => (
                                            <Badge key={index} variant="primary" size="md">{interest}</Badge>
                                        )) : <p className="text-sm text-gray-400">Not specified</p>}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-md font-medium text-gray-900">Investment Stages</h3>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {investor.investmentStage?.length ? investor.investmentStage.map((stage, index) => (
                                            <Badge key={index} variant="secondary" size="md">{stage}</Badge>
                                        )) : <p className="text-sm text-gray-400">Not specified</p>}
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader className="flex justify-between items-center">
                            <h2 className="text-lg font-medium text-gray-900">Portfolio Companies</h2>
                            <span className="text-sm text-gray-500">{investor.portfolioCompanies?.length || 0} companies</span>
                        </CardHeader>
                        <CardBody>
                            {investor.portfolioCompanies?.length ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {investor.portfolioCompanies.map((company, index) => (
                                        <div key={index} className="flex items-center p-3 border border-gray-200 rounded-md">
                                            <div className="p-3 bg-blue-50 rounded-md mr-3">
                                                <Briefcase size={18} className="text-blue-700" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-900">{company}</h3>
                                                <p className="text-xs text-gray-500">Portfolio Company</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-sm text-gray-400">No portfolio companies yet.</p>}
                        </CardBody>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader><h2 className="text-lg font-medium text-gray-900">Investment Details</h2></CardHeader>
                        <CardBody>
                            <div className="space-y-4">
                                <div>
                                    <span className="text-sm text-gray-500">Investment Range</span>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {investor.minimumInvestment || '$50K'} - {investor.maximumInvestment || '$500K'}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">Total Investments</span>
                                    <p className="text-md font-medium text-gray-900">{investor.totalInvestments || 0} companies</p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader><h2 className="text-lg font-medium text-gray-900">Investment Stats</h2></CardHeader>
                        <CardBody>
                            <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900">Successful Exits</h3>
                                        <p className="text-xl font-semibold text-blue-700 mt-1">4</p>
                                    </div>
                                    <BarChart3 size={24} className="text-blue-600" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
};