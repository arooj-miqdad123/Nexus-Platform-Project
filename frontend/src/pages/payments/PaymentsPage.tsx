import React, { useState, useEffect } from 'react';
import { DollarSign, ArrowUpRight, ArrowDownLeft, RefreshCw, CheckCircle, Clock, XCircle, CreditCard, TrendingUp, Wallet } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';

interface Transaction {
    id: string;
    type: 'deposit' | 'withdraw' | 'transfer';
    amount: number;
    currency: string;
    description: string;
    status: 'Pending' | 'Completed' | 'Failed';
    date: string;
    to?: string;
}

const loadTransactions = (): Transaction[] => {
    try {
        const saved = localStorage.getItem('nexus_transactions');
        return saved ? JSON.parse(saved) : [
            { id: 'tx-demo-1', type: 'deposit', amount: 50000, currency: 'USD', description: 'Initial funding deposit', status: 'Completed', date: '2026-06-01' },
            { id: 'tx-demo-2', type: 'transfer', amount: 10000, currency: 'USD', description: 'Transfer to TechWave Inc', status: 'Completed', date: '2026-06-10', to: 'TechWave Inc' },
            { id: 'tx-demo-3', type: 'withdraw', amount: 5000, currency: 'USD', description: 'Platform fee withdrawal', status: 'Completed', date: '2026-06-15' },
        ];
    } catch { return []; }
};

const saveTransactions = (txns: Transaction[]) => {
    try { localStorage.setItem('nexus_transactions', JSON.stringify(txns)); } catch { }
};

export const PaymentsPage: React.FC = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>(loadTransactions());
    const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'transfer'>('deposit');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [toName, setToName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const balance = transactions
        .filter(t => t.status === 'Completed')
        .reduce((acc, t) => {
            if (t.type === 'deposit') return acc + t.amount;
            if (t.type === 'withdraw' || t.type === 'transfer') return acc - t.amount;
            return acc;
        }, 0);

    const totalDeposited = transactions.filter(t => t.type === 'deposit' && t.status === 'Completed').reduce((a, t) => a + t.amount, 0);
    const totalWithdrawn = transactions.filter(t => (t.type === 'withdraw' || t.type === 'transfer') && t.status === 'Completed').reduce((a, t) => a + t.amount, 0);

    const handleSubmit = async () => {
        setErrorMsg(null);
        setSuccessMsg(null);

        const amt = parseFloat(amount);
        if (!amt || amt <= 0) { setErrorMsg('Please enter a valid amount.'); return; }
        if (amt > 1000000) { setErrorMsg('Maximum transaction limit: $1,000,000'); return; }
        if ((activeTab === 'withdraw' || activeTab === 'transfer') && amt > balance) {
            setErrorMsg('Insufficient balance for this transaction.'); return;
        }
        if (activeTab === 'deposit' && cardNumber.replace(/\s/g, '').length < 16) {
            setErrorMsg('Please enter a valid 16-digit card number.'); return;
        }

        setIsProcessing(true);

        // Stripe sandbox simulation (3 second delay)
        await new Promise(r => setTimeout(r, 2500));

        // 90% success rate simulate karo
        const isSuccess = Math.random() > 0.1;

        const newTx: Transaction = {
            id: `tx-${Date.now()}`,
            type: activeTab,
            amount: amt,
            currency: 'USD',
            description: description || `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} via Nexus`,
            status: isSuccess ? 'Completed' : 'Failed',
            date: new Date().toISOString().split('T')[0],
            to: activeTab === 'transfer' ? toName : undefined,
        };

        setTransactions(prev => {
            const updated = [newTx, ...prev];
            saveTransactions(updated);
            return updated;
        });

        if (isSuccess) {
            setSuccessMsg(`✅ ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} of $${amt.toLocaleString()} successful!`);
        } else {
            setErrorMsg('❌ Transaction failed. Please try again. (Stripe sandbox test failure)');
        }

        setAmount('');
        setDescription('');
        setCardNumber('');
        setToName('');
        setIsProcessing(false);
        setTimeout(() => { setSuccessMsg(null); setErrorMsg(null); }, 5000);
    };

    const statusBadge = (status: Transaction['status']) => {
        if (status === 'Completed') return <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full"><CheckCircle size={12} /> Completed</span>;
        if (status === 'Pending') return <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full"><Clock size={12} /> Pending</span>;
        return <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full"><XCircle size={12} /> Failed</span>;
    };

    const formatCardNumber = (val: string) => {
        const digits = val.replace(/\D/g, '').slice(0, 16);
        return digits.replace(/(.{4})/g, '$1 ').trim();
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Payments & Transactions</h1>
                <p className="text-gray-600">Manage your investments and transfers — Stripe Sandbox Mode</p>
            </div>

            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                    <CardBody className="p-5">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-blue-100 text-sm">Total Balance</p>
                                <p className="text-3xl font-bold mt-1">${balance.toLocaleString()}</p>
                            </div>
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Wallet size={24} />
                            </div>
                        </div>
                        <p className="text-blue-100 text-xs mt-3">Available for transactions</p>
                    </CardBody>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                    <CardBody className="p-5">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-green-600 text-sm">Total Deposited</p>
                                <p className="text-2xl font-bold mt-1 text-green-700">${totalDeposited.toLocaleString()}</p>
                            </div>
                            <div className="p-2 bg-green-200 rounded-lg">
                                <ArrowDownLeft size={24} className="text-green-700" />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
                    <CardBody className="p-5">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-orange-600 text-sm">Total Withdrawn/Sent</p>
                                <p className="text-2xl font-bold mt-1 text-orange-700">${totalWithdrawn.toLocaleString()}</p>
                            </div>
                            <div className="p-2 bg-orange-200 rounded-lg">
                                <ArrowUpRight size={24} className="text-orange-700" />
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Transaction Form */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <h2 className="text-lg font-medium text-gray-900">New Transaction</h2>
                        <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                            <CreditCard size={12} /> Stripe Sandbox — No real charges
                        </p>
                    </CardHeader>
                    <CardBody className="space-y-4">
                        {/* Tabs */}
                        <div className="flex rounded-lg border border-gray-200 p-1 bg-gray-50">
                            {(['deposit', 'withdraw', 'transfer'] as const).map(tab => (
                                <button key={tab} onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all capitalize ${activeTab === tab ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Amount */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (USD)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                                <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                                    placeholder="0.00" min="1"
                                    className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                        </div>

                        {/* Card number only for deposit */}
                        {activeTab === 'deposit' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Card Number (Test)</label>
                                <input type="text" value={cardNumber}
                                    onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                                    placeholder="4242 4242 4242 4242"
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                <p className="text-xs text-gray-400 mt-1">Use test card: 4242 4242 4242 4242</p>
                            </div>
                        )}

                        {/* Transfer recipient */}
                        {activeTab === 'transfer' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Transfer To</label>
                                <input type="text" value={toName} onChange={e => setToName(e.target.value)}
                                    placeholder="Startup or investor name"
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                        )}

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                            <input type="text" value={description} onChange={e => setDescription(e.target.value)}
                                placeholder="e.g. Series A investment"
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>

                        {/* Messages */}
                        {successMsg && (
                            <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-sm">{successMsg}</div>
                        )}
                        {errorMsg && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">{errorMsg}</div>
                        )}

                        <Button fullWidth isLoading={isProcessing} onClick={handleSubmit}
                            leftIcon={activeTab === 'deposit' ? <ArrowDownLeft size={16} /> : activeTab === 'withdraw' ? <ArrowUpRight size={16} /> : <RefreshCw size={16} />}>
                            {isProcessing ? 'Processing via Stripe...' : `Confirm ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
                        </Button>

                        <div className="text-center">
                            <p className="text-xs text-gray-400">🔒 Secured by Stripe Sandbox | No real money charged</p>
                        </div>
                    </CardBody>
                </Card>

                {/* Transaction History */}
                <Card className="lg:col-span-3">
                    <CardHeader className="flex justify-between items-center">
                        <h2 className="text-lg font-medium text-gray-900">Transaction History</h2>
                        <span className="text-sm text-gray-500">{transactions.length} transactions</span>
                    </CardHeader>
                    <CardBody>
                        {transactions.length === 0 ? (
                            <div className="text-center py-12">
                                <DollarSign size={48} className="mx-auto text-gray-300 mb-3" />
                                <p className="text-gray-500">Koi transaction nahi mila.</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {transactions.map(tx => (
                                    <div key={tx.id}
                                        className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${tx.type === 'deposit' ? 'bg-green-100' : tx.type === 'withdraw' ? 'bg-orange-100' : 'bg-blue-100'}`}>
                                                {tx.type === 'deposit' ? <ArrowDownLeft size={18} className="text-green-600" /> :
                                                    tx.type === 'withdraw' ? <ArrowUpRight size={18} className="text-orange-600" /> :
                                                        <RefreshCw size={18} className="text-blue-600" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {tx.description}
                                                    {tx.to && <span className="text-gray-500"> → {tx.to}</span>}
                                                </p>
                                                <p className="text-xs text-gray-400">{tx.date} • {tx.type}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-sm font-bold ${tx.type === 'deposit' ? 'text-green-600' : 'text-orange-600'}`}>
                                                {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toLocaleString()}
                                            </p>
                                            {statusBadge(tx.status)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>
        </div>
    );
};
