import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, CheckCircle, XCircle, Plus } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { getMyMeetings, scheduleMeeting, updateMeetingStatus } from '../../api';
import { useAuth } from '../../context/AuthContext';

interface Meeting {
    id: number;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    status: string;
    meetLink: string;
    host: { id: number; fullName: string; email: string };
    participant: { id: number; fullName: string; email: string };
}

export const DealsPage: React.FC = () => {
    const { user } = useAuth();
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);

    // New meeting form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [participantId, setParticipantId] = useState('');
    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchMeetings = async () => {
        try {
            setIsLoading(true);
            const res = await getMyMeetings();
            setMeetings(res.data || res || []);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMeetings();
    }, []);

    const handleSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        setIsSubmitting(true);
        try {
            await scheduleMeeting({
                title,
                description,
                startTime: new Date(startTime).toISOString(),
                endTime: new Date(endTime).toISOString(),
                participantId: parseInt(participantId),
            });
            setShowForm(false);
            setTitle(''); setDescription(''); setStartTime(''); setEndTime(''); setParticipantId('');
            fetchMeetings();
        } catch (err) {
            setFormError((err as Error).message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStatusUpdate = async (id: number, status: string) => {
        try {
            await updateMeetingStatus(id, status);
            fetchMeetings();
        } catch (err) {
            alert((err as Error).message);
        }
    };

    const getStatusBadge = (status: string) => {
        const map: Record<string, 'success' | 'warning' | 'error' | undefined> = {
            Pending: 'warning',
            Accepted: 'success',
            Rejected: 'error',
            Cancelled: 'error'
        };
        return <Badge variant={map[status] || undefined}>{status}</Badge>;
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Meetings</h1>
                    <p className="text-gray-600">Schedule and manage your meetings</p>
                </div>
                <Button leftIcon={<Plus size={18} />} onClick={() => setShowForm(!showForm)}>
                    Schedule Meeting
                </Button>
            </div>

            {/* Schedule Meeting Form */}
            {showForm && (
                <Card>
                    <CardHeader><h2 className="text-lg font-medium text-gray-900">New Meeting</h2></CardHeader>
                    <CardBody>
                        {formError && <p className="text-red-600 text-sm mb-4">{formError}</p>}
                        <form onSubmit={handleSchedule} className="space-y-4">
                            <Input label="Meeting Title" value={title} onChange={e => setTitle(e.target.value)} required fullWidth />
                            <Input label="Description" value={description} onChange={e => setDescription(e.target.value)} fullWidth />
                            <Input label="Participant User ID" type="number" value={participantId} onChange={e => setParticipantId(e.target.value)} required fullWidth />
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Start Time" type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} required fullWidth />
                                <Input label="End Time" type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} required fullWidth />
                            </div>
                            <div className="flex gap-3">
                                <Button type="submit" isLoading={isSubmitting}>Schedule</Button>
                                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                            </div>
                        </form>
                    </CardBody>
                </Card>
            )}

            {/* Meetings List */}
            {isLoading ? (
                <p className="text-gray-500">Loading meetings...</p>
            ) : error ? (
                <p className="text-red-600">{error}</p>
            ) : meetings.length === 0 ? (
                <Card><CardBody><p className="text-center text-gray-500 py-8">No meetings yet. Schedule your first one!</p></CardBody></Card>
            ) : (
                <div className="space-y-4">
                    {meetings.map((meeting) => (
                        <Card key={meeting.id}>
                            <CardBody>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">{meeting.title}</h3>
                                            {getStatusBadge(meeting.status)}
                                        </div>
                                        <p className="text-gray-600 text-sm mb-3">{meeting.description}</p>
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={14} /> {new Date(meeting.startTime).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock size={14} />
                                                {new Date(meeting.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                {' - '}
                                                {new Date(meeting.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="mt-2 text-sm text-gray-500">
                                            <span>Host: <strong>{meeting.host?.fullName}</strong></span>
                                            <span className="ml-4">With: <strong>{meeting.participant?.fullName}</strong></span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 ml-4">
                                        {/* ✅ Clean Fix: Removed 'any' keyword completely, casted safely as structured object */}
                                        {meeting.status === 'Pending' && meeting.participant?.email === (user as { email?: string } | null)?.email && (
                                            <>
                                                <Button size="sm" leftIcon={<CheckCircle size={14} />} onClick={() => handleStatusUpdate(meeting.id, 'Accepted')}>Accept</Button>
                                                <Button size="sm" variant="outline" leftIcon={<XCircle size={14} />} onClick={() => handleStatusUpdate(meeting.id, 'Rejected')}>Reject</Button>
                                            </>
                                        )}
                                        {meeting.status === 'Accepted' && meeting.meetLink && (
                                            <a href={meeting.meetLink} target="_blank" rel="noreferrer">
                                                <Button size="sm" leftIcon={<Video size={14} />}>Join Call</Button>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};