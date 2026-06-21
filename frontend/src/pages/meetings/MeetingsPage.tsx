import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Check, X, Plus } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { getMyMeetings, scheduleMeeting, updateMeetingStatus } from '../../api';
import toast from 'react-hot-toast';

interface Meeting {
    id: number;
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    status: string;
    meetLink?: string;
    host: { id: number; fullName: string; email: string; role: string };
    participant: { id: number; fullName: string; email: string; role: string };
}

export const MeetingsPage: React.FC = () => {
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        participantId: '',
    });

    const fetchMeetings = async () => {
        try {
            const res = await getMyMeetings();
            setMeetings(res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMeetings();
    }, []);

    const handleSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await scheduleMeeting({
                ...form,
                participantId: parseInt(form.participantId),
                startTime: new Date(form.startTime).toISOString(),
                endTime: new Date(form.endTime).toISOString(),
            });
            toast.success('Meeting scheduled!');
            setShowForm(false);
            fetchMeetings();
        } catch (err) {
            toast.error((err as Error).message);
        }
    };

    const handleStatus = async (id: number, status: string) => {
        try {
            await updateMeetingStatus(id, status);
            toast.success(`Meeting ${status}`);
            fetchMeetings();
        } catch (err) {
            toast.error((err as Error).message);
        }
    };

    const getStatusColor = (status: string) => {
        if (status === 'Accepted') return 'success';
        if (status === 'Rejected' || status === 'Cancelled') return 'error';
        return 'warning';
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meetings</h1>
                <Button onClick={() => setShowForm(!showForm)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Meeting
                </Button>
            </div>

            {showForm && (
                <Card className="mb-6">
                    <CardHeader>
                        <h2 className="text-lg font-semibold">New Meeting</h2>
                    </CardHeader>
                    <CardBody>
                        <form onSubmit={handleSchedule} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Title</label>
                                <input
                                    className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    required
                                    placeholder="Meeting title"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    placeholder="Optional description"
                                    rows={2}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Participant User ID</label>
                                <input
                                    className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                                    value={form.participantId}
                                    onChange={e => setForm({ ...form, participantId: e.target.value })}
                                    required
                                    type="number"
                                    placeholder="Enter participant's user ID"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Start Time</label>
                                    <input
                                        className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                                        type="datetime-local"
                                        value={form.startTime}
                                        onChange={e => setForm({ ...form, startTime: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">End Time</label>
                                    <input
                                        className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                                        type="datetime-local"
                                        value={form.endTime}
                                        onChange={e => setForm({ ...form, endTime: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit">Schedule</Button>
                                <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                            </div>
                        </form>
                    </CardBody>
                </Card>
            )}

            {isLoading ? (
                <p className="text-gray-500">Loading meetings...</p>
            ) : meetings.length === 0 ? (
                <Card>
                    <CardBody>
                        <div className="text-center py-8 text-gray-500">
                            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-40" />
                            <p>No meetings yet. Schedule your first one!</p>
                        </div>
                    </CardBody>
                </Card>
            ) : (
                <div className="space-y-4">
                    {meetings.map(m => (
                        <Card key={m.id}>
                            <CardBody>
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="font-semibold text-gray-900 dark:text-white">{m.title}</h3>
                                            <Badge variant={getStatusColor(m.status)}>{m.status}</Badge>
                                        </div>
                                        {m.description && <p className="text-sm text-gray-500 mb-2">{m.description}</p>}
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                {new Date(m.startTime).toLocaleString()} — {new Date(m.endTime).toLocaleTimeString()}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <User className="w-3.5 h-3.5" />
                                                {m.host.fullName} → {m.participant.fullName}
                                            </span>
                                        </div>
                                        {m.meetLink && (
                                            <a href={m.meetLink} target="_blank" rel="noreferrer"
                                                className="text-sm text-blue-500 hover:underline mt-1 block">
                                                Join Meeting Link
                                            </a>
                                        )}
                                    </div>
                                    {m.status === 'Pending' && (
                                        <div className="flex gap-2 ml-4">
                                            <button onClick={() => handleStatus(m.id, 'Accepted')}
                                                className="p-1.5 rounded-full bg-green-100 text-green-600 hover:bg-green-200">
                                                <Check className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleStatus(m.id, 'Rejected')}
                                                className="p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};