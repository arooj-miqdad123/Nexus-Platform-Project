import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Check, X } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button'; // Baqi jagah ke liye rehne dein
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

    async function fetchMeetings() {
        try {
            const res = await getMyMeetings() as { data?: Meeting[] } | Meeting[];

            if (res && 'data' in res && res.data) {
                setMeetings(res.data);
            } else if (Array.isArray(res)) {
                setMeetings(res);
            } else {
                setMeetings([]);
            }
        } catch (err) {
            console.error(err);
            toast.error("Meetings fetch karne mein masla hua");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchMeetings();
    }, []);

    const handleSchedule = async (e: React.FormEvent) => {
        e.preventDefault();

        console.log("🔥 Schedule button clicked");

        const participantId = Number(form.participantId);

        if (!participantId || participantId <= 0) {
            toast.error('Enter valid Participant ID');
            return;
        }

        if (!form.startTime || !form.endTime) {
            toast.error('Start and End time required');
            return;
        }

        if (new Date(form.startTime) >= new Date(form.endTime)) {
            toast.error('End time must be later than start time');
            return;
        }

        try {
            const payload = {
                title: form.title,
                description: form.description,
                participantId,
                startTime: new Date(form.startTime).toISOString(),
                endTime: new Date(form.endTime).toISOString(),
            };

            console.log("📦 SENDING DATA:", payload);

            await scheduleMeeting(payload);

            toast.success('Meeting scheduled!');

            setForm({
                title: '',
                description: '',
                startTime: '',
                endTime: '',
                participantId: '',
            });

            setShowForm(false);
            fetchMeetings();

        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } }; message?: string };
            console.log("❌ API ERROR:", error?.response?.data || error?.message);
            toast.error(error?.response?.data?.message || 'Schedule failed');
        }
    };

    const handleStatus = async (id: number, status: string) => {
        try {
            await updateMeetingStatus(id, status);
            toast.success(`Meeting ${status}`);
            fetchMeetings();
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } }; message?: string };
            toast.error(error?.response?.data?.message || error?.message || 'Status update failed');
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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-gray-500" />
                    Meetings
                </h1>

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
                            <input
                                placeholder="Meeting title"
                                className="w-full border rounded-lg px-3 py-2"
                                value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                                required
                            />

                            <textarea
                                placeholder="Optional description"
                                className="w-full border rounded-lg px-3 py-2"
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                            />

                            <input
                                type="number"
                                placeholder="Participant User ID"
                                className="w-full border rounded-lg px-3 py-2"
                                value={form.participantId}
                                onChange={e => setForm({ ...form, participantId: e.target.value })}
                                required
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="datetime-local"
                                    className="border rounded-lg px-3 py-2"
                                    value={form.startTime}
                                    onChange={e => setForm({ ...form, startTime: e.target.value })}
                                    required
                                />

                                <input
                                    type="datetime-local"
                                    className="border rounded-lg px-3 py-2"
                                    value={form.endTime}
                                    onChange={e => setForm({ ...form, endTime: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="flex gap-2">
                                {/* ✅ Custom Button hata kar standard native HTML buttons laga diye hain */}
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
                                >
                                    Schedule
                                </button>

                                <button
                                    type="button"
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-4 py-2 rounded-lg transition-colors dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                                    onClick={() => setShowForm(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </CardBody>
                </Card>
            )}

            {isLoading ? (
                <p>Loading...</p>
            ) : (
                meetings.map(m => (
                    <Card key={m.id}>
                        <CardBody>
                            <h3>{m.title}</h3>
                            <Badge variant={getStatusColor(m.status)}>
                                {m.status}
                            </Badge>

                            {m.status === 'Pending' && (
                                <div className="flex gap-2 mt-2">
                                    <button onClick={() => handleStatus(m.id, 'Accepted')}>
                                        <Check />
                                    </button>
                                    <button onClick={() => handleStatus(m.id, 'Rejected')}>
                                        <X />
                                    </button>
                                </div>
                            )}
                        </CardBody>
                    </Card>
                ))
            )}
        </div>
    );
};