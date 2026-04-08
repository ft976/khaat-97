import React, { useState, useEffect } from 'react';
import { Plus, ArrowLeft, User, Users, UserPlus, History, IndianRupee, ChevronRight, Trash2, X, TrendingUp, TrendingDown, Wallet, AlertCircle, Download, Pencil, CheckCircle2 } from 'lucide-react';
import { Friend, Transaction, TransactionType } from './types';
import { formatCurrency, cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';

// Custom Logo Component
const SplitMateLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="9" cy="12" r="7" fill="currentColor" fillOpacity="0.5" />
    <circle cx="15" cy="12" r="7" fill="currentColor" fillOpacity="0.9" />
  </svg>
);

// Helper for relative dates
function formatRelativeDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return 'Today, ' + date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  if (days === 1) return 'Yesterday, ' + date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' + date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

// Animation variants
const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 }
};

export default function App() {
  const [friends, setFriends] = useState<Friend[]>(() => {
    const saved = localStorage.getItem('khatabook_friends');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeFriendId, setActiveFriendId] = useState<string | null>(null);
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const [newFriendName, setNewFriendName] = useState('');
  const [toasts, setToasts] = useState<{id: string, message: string}[]>([]);

  const showToast = (message: string) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  // Save to local storage whenever friends change
  useEffect(() => {
    localStorage.setItem('khatabook_friends', JSON.stringify(friends));
  }, [friends]);

  const addFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFriendName.trim()) return;
    
    const newFriend: Friend = {
      id: crypto.randomUUID(),
      name: newFriendName.trim(),
      balance: 0,
      transactions: [],
    };
    
    setFriends([newFriend, ...friends]);
    setNewFriendName('');
    setIsAddingFriend(false);
    showToast(`Added ${newFriend.name} to your list`);
  };

  const addTransaction = (friendId: string, amount: number, reason: string, type: TransactionType) => {
    setFriends(prev => prev.map(friend => {
      if (friend.id !== friendId) return friend;
      
      const newTransaction: Transaction = {
        id: crypto.randomUUID(),
        amount,
        reason,
        type,
        date: new Date().toISOString(),
      };
      
      const newBalance = type === 'GAVE' 
        ? friend.balance + amount 
        : friend.balance - amount;
        
      return {
        ...friend,
        balance: newBalance,
        transactions: [newTransaction, ...friend.transactions],
      };
    }));
    showToast('Transaction added successfully');
  };

  const editTransaction = (friendId: string, txId: string, amount: number, reason: string, type: TransactionType) => {
    setFriends(prev => prev.map(friend => {
      if (friend.id !== friendId) return friend;
      
      const updatedTransactions = friend.transactions.map(tx => 
        tx.id === txId ? { ...tx, amount, reason, type } : tx
      );
      
      const newBalance = updatedTransactions.reduce((acc, tx) => {
        return tx.type === 'GAVE' ? acc + tx.amount : acc - tx.amount;
      }, 0);
      
      return {
        ...friend,
        balance: newBalance,
        transactions: updatedTransactions,
      };
    }));
    showToast('Transaction updated');
  };

  const deleteFriend = (friendId: string) => {
    setFriends(prev => prev.filter(f => f.id !== friendId));
    setActiveFriendId(null);
    showToast('Friend deleted');
  };

  const totalBalance = friends.reduce((acc, f) => acc + f.balance, 0);
  const totalGave = friends.filter(f => f.balance > 0).reduce((acc, f) => acc + f.balance, 0);
  const totalGot = friends.filter(f => f.balance < 0).reduce((acc, f) => acc + Math.abs(f.balance), 0);

  const activeFriend = friends.find(f => f.id === activeFriendId);

  return (
    <div className="min-h-[100dvh] bg-zinc-100 text-zinc-900 font-sans selection:bg-indigo-100 flex justify-center bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
      <div className="w-full max-w-md bg-zinc-50 min-h-screen shadow-2xl relative flex flex-col">
        <AnimatePresence mode="wait">
          {!activeFriendId ? (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col relative"
            >
              {/* Header */}
              <header className="bg-zinc-950 text-white p-6 pb-8 rounded-b-[2.5rem] shadow-2xl z-10 shrink-0 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                  <div className="absolute -top-[50%] -left-[10%] w-[70%] h-[150%] bg-indigo-500/20 blur-[80px] rounded-full"></div>
                  <div className="absolute -bottom-[50%] -right-[10%] w-[70%] h-[150%] bg-emerald-500/10 blur-[80px] rounded-full"></div>
                </div>
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-display font-bold flex items-center gap-2 tracking-tight">
                      <SplitMateLogo className="w-8 h-8 text-indigo-400" />
                      SplitMate
                    </h1>
                    <div className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border border-white/10 text-zinc-300">
                      Personal
                    </div>
                  </div>
                  
                  <div className="bg-zinc-900/50 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-inner">
                    <p className="text-zinc-400 text-sm font-medium mb-1">Net Balance</p>
                    <h2 className={cn("text-4xl font-display font-extrabold tracking-tight mb-6", totalBalance >= 0 ? "text-white" : "text-rose-400")}>
                      {totalBalance >= 0 ? '' : '-'}{formatCurrency(Math.abs(totalBalance))}
                    </h2>
                    
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                      <div className="flex flex-col">
                        <p className="text-zinc-400 text-xs font-medium mb-1 flex items-center gap-1.5">
                          <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                          You will give
                        </p>
                        <p className="text-rose-400 font-display font-bold text-lg">{formatCurrency(totalGot)}</p>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-zinc-400 text-xs font-medium mb-1 flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                          You will get
                        </p>
                        <p className="text-emerald-400 font-display font-bold text-lg">{formatCurrency(totalGave)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </header>

              {/* Friends List */}
              <div className="flex-1 p-4 pb-24">
                <div className="flex items-center justify-between mb-4 px-2 mt-2">
                  <h3 className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Your Friends</h3>
                  <span className="text-xs bg-zinc-200/80 text-zinc-600 px-2.5 py-1 rounded-full font-bold">
                    {friends.length}
                  </span>
                </div>

                {friends.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12 px-4 flex flex-col items-center justify-center mt-8"
                  >
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-indigo-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                      <div className="w-24 h-24 bg-gradient-to-br from-indigo-50 to-blue-100 text-indigo-600 rounded-full flex items-center justify-center relative border-4 border-white shadow-xl">
                        <Users className="w-10 h-10" />
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                        <IndianRupee className="w-5 h-5" />
                      </div>
                    </div>
                    <h3 className="text-xl font-display font-extrabold text-zinc-900 mb-2 tracking-tight">No friends yet</h3>
                    <p className="text-zinc-500 text-sm max-w-[260px] mx-auto leading-relaxed mb-8">
                      Add your friends to start tracking shared expenses, splits, and balances easily.
                    </p>
                    <button
                      onClick={() => setIsAddingFriend(true)}
                      className="bg-indigo-600 text-white font-bold py-3.5 px-8 rounded-2xl shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2"
                    >
                      <UserPlus className="w-5 h-5" />
                      Add First Friend
                    </button>
                  </motion.div>
                ) : (
                  <motion.div 
                    variants={listVariants}
                    initial="hidden"
                    animate="show"
                    className="space-y-3"
                  >
                    {friends.map(friend => (
                      <motion.button
                        layout
                        variants={itemVariants}
                        key={friend.id}
                        onClick={() => setActiveFriendId(friend.id)}
                        className="w-full bg-white border border-zinc-200/60 p-4 rounded-3xl shadow-sm flex items-center justify-between hover:shadow-md hover:border-indigo-200 active:scale-[0.98] transition-all text-left group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-50 to-blue-50 text-indigo-600 rounded-full flex items-center justify-center font-display font-bold text-xl shrink-0 group-hover:scale-110 transition-transform shadow-inner border border-indigo-100/50">
                            {friend.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="overflow-hidden">
                            <h4 className="font-bold text-zinc-900 truncate text-base">{friend.name}</h4>
                            <p className="text-xs text-zinc-500 mt-0.5 font-medium">
                              {friend.transactions.length === 0 ? 'No transactions' : `${friend.transactions.length} transaction${friend.transactions.length !== 1 ? 's' : ''}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-3 shrink-0 ml-2">
                          <div>
                            {friend.balance === 0 ? (
                              <p className="text-zinc-400 font-bold text-sm bg-zinc-100 px-3 py-1 rounded-full">Settled</p>
                            ) : (
                              <>
                                <p className={cn("font-bold text-base", friend.balance > 0 ? "text-emerald-600" : "text-rose-500")}>
                                  {formatCurrency(friend.balance)}
                                </p>
                                <p className="text-[10px] text-zinc-500 uppercase font-bold mt-0.5 tracking-wider">
                                  {friend.balance > 0 ? 'You get' : 'You give'}
                                </p>
                              </>
                            )}
                          </div>
                          <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-indigo-400 transition-colors" />
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Add Friend FAB */}
              <div className="fixed bottom-8 z-20 w-full max-w-md pointer-events-none flex justify-end px-6">
                <button
                  onClick={() => setIsAddingFriend(true)}
                  className="bg-zinc-900 text-white w-16 h-16 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.3)] flex items-center justify-center hover:bg-zinc-800 hover:scale-105 active:scale-95 transition-all pointer-events-auto border border-zinc-700 group"
                >
                  <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </div>

              {/* Add Friend Modal */}
              <AnimatePresence>
                {isAddingFriend && (
                  <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-zinc-900/40 backdrop-blur-md p-4">
                    <motion.div
                      initial={{ opacity: 0, y: 100, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 100, scale: 0.95 }}
                      transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                      className="bg-white w-full max-w-sm rounded-[2.5rem] p-6 shadow-2xl border border-zinc-100"
                    >
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-display font-bold text-zinc-900">Add New Friend</h3>
                        <button type="button" onClick={() => setIsAddingFriend(false)} className="p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 rounded-full transition-colors">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <form onSubmit={addFriend}>
                        <div className="mb-8">
                          <label htmlFor="name" className="block text-sm font-bold text-zinc-700 mb-2">Friend's Name</label>
                          <input
                            type="text"
                            id="name"
                            value={newFriendName}
                            onChange={(e) => setNewFriendName(e.target.value)}
                            className="w-full px-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-zinc-900 placeholder:text-zinc-400"
                            placeholder="e.g. Rahul, Priya..."
                            autoFocus
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={!newFriendName.trim()}
                          className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-lg shadow-indigo-600/20"
                        >
                          Add Friend
                        </button>
                      </form>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <FriendLedger 
              key="ledger"
              friend={activeFriend!} 
              onBack={() => setActiveFriendId(null)} 
              onAddTransaction={addTransaction}
              onEditTransaction={editTransaction}
              onDelete={() => deleteFriend(activeFriend!.id)}
            />
          )}
        </AnimatePresence>

        {/* Toasts */}
        <div className="fixed top-4 left-0 right-0 z-[100] flex flex-col items-center gap-2 pointer-events-none px-4">
          <AnimatePresence>
            {toasts.map(toast => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                className="bg-zinc-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 pointer-events-auto border border-zinc-800"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-medium">{toast.message}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function FriendLedger({ 
  friend, 
  onBack, 
  onAddTransaction,
  onEditTransaction,
  onDelete
}: { 
  key?: string;
  friend: Friend; 
  onBack: () => void; 
  onAddTransaction: (friendId: string, amount: number, reason: string, type: TransactionType) => void;
  onEditTransaction: (friendId: string, txId: string, amount: number, reason: string, type: TransactionType) => void;
  onDelete: () => void;
}) {
  const [isAddingTx, setIsAddingTx] = useState(false);
  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  const [txType, setTxType] = useState<TransactionType>('GAVE');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const openEditModal = (tx: Transaction) => {
    setEditingTxId(tx.id);
    setTxType(tx.type);
    setAmount(tx.amount.toString());
    setReason(tx.reason || '');
    setIsAddingTx(true);
  };

  const closeTxModal = () => {
    setIsAddingTx(false);
    setEditingTxId(null);
    setAmount('');
    setReason('');
  };

  const handleExportCSV = () => {
    if (friend.transactions.length === 0) return;

    const headers = ['Date', 'Description', 'Type', 'Amount (INR)'];
    const rows = friend.transactions.map(tx => {
      const date = new Date(tx.date).toLocaleString('en-IN');
      const reasonStr = `"${(tx.reason || '').replace(/"/g, '""')}"`;
      const type = tx.type === 'GAVE' ? 'You Gave' : 'You Got';
      return [date, reasonStr, type, tx.amount].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${friend.name.replace(/\s+/g, '_')}_SplitMate.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;
    
    if (editingTxId) {
      onEditTransaction(friend.id, editingTxId, numAmount, reason, txType);
    } else {
      onAddTransaction(friend.id, numAmount, reason, txType);
    }
    closeTxModal();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="flex-1 flex flex-col min-h-screen bg-zinc-50 relative pb-28"
    >
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl px-4 py-4 flex items-center justify-between shrink-0 z-30 shadow-sm sticky top-0 border-b border-zinc-100">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onBack} className="p-2 -ml-2 text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors active:scale-90">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-50 to-blue-50 text-indigo-600 rounded-full flex items-center justify-center font-display font-bold text-lg shrink-0 border border-indigo-100/50">
              {friend.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-lg font-bold text-zinc-900 truncate max-w-[160px]">{friend.name}</h2>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {friend.transactions.length > 0 && (
            <button type="button" onClick={handleExportCSV} title="Export CSV" className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors active:scale-90">
              <Download className="w-5 h-5" />
            </button>
          )}
          <button type="button" onClick={() => setShowDeleteConfirm(true)} title="Delete Friend" className="p-2 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors active:scale-90">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Balance Summary */}
      <div className="bg-white px-6 py-8 shadow-sm mb-2 shrink-0 border-b border-zinc-100">
        <div className="flex flex-col items-center text-center">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
            {friend.balance === 0 
              ? 'Balance Settled' 
              : friend.balance > 0 
                ? 'You will get' 
                : 'You will give'}
          </p>
          <h3 className={cn(
            "text-4xl font-display font-extrabold tracking-tight",
            friend.balance === 0 ? "text-zinc-900" : friend.balance > 0 ? "text-emerald-600" : "text-rose-500"
          )}>
            {formatCurrency(friend.balance)}
          </h3>
        </div>
      </div>

      {/* Transactions List */}
      <div className="flex-1 p-4">
        {friend.transactions.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 flex flex-col items-center justify-center"
          >
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-zinc-200 rounded-full blur-xl opacity-60"></div>
              <div className="w-24 h-24 bg-gradient-to-br from-zinc-50 to-zinc-100 text-zinc-400 rounded-full flex items-center justify-center relative border-4 border-white shadow-lg">
                <History className="w-10 h-10" />
              </div>
            </div>
            <h3 className="text-zinc-900 font-display font-bold text-xl mb-2 tracking-tight">No transactions yet</h3>
            <p className="text-zinc-500 text-sm max-w-[220px] mx-auto leading-relaxed">Add a transaction below to start tracking your shared expenses.</p>
          </motion.div>
        ) : (
          <motion.div 
            variants={listVariants}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {friend.transactions.map(tx => (
              <motion.div layout variants={itemVariants} key={tx.id} className="flex flex-col">
                <div className="flex items-center justify-between mb-1.5 px-2">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    {formatRelativeDate(tx.date)}
                  </span>
                </div>
                <div className={cn(
                  "bg-white p-4 rounded-3xl shadow-sm border flex items-center justify-between hover:shadow-md transition-all group relative overflow-hidden",
                  tx.type === 'GAVE' ? "border-rose-100 hover:border-rose-200" : "border-emerald-100 hover:border-emerald-200"
                )}>
                  <div className={cn(
                    "absolute left-0 top-0 bottom-0 w-1.5",
                    tx.type === 'GAVE' ? "bg-rose-500" : "bg-emerald-500"
                  )} />
                  <div className="flex-1 mr-4 pl-2">
                    <p className="font-bold text-zinc-900 break-words text-base">{tx.reason || 'No description'}</p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button 
                      onClick={() => openEditModal(tx)}
                      className="p-2 text-zinc-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 active:scale-90"
                      title="Edit Transaction"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <div className="text-right shrink-0 bg-zinc-50 px-3 py-2 rounded-xl">
                      <p className={cn(
                        "font-extrabold text-lg",
                        tx.type === 'GAVE' ? "text-rose-500" : "text-emerald-600"
                      )}>
                        {formatCurrency(tx.amount)}
                      </p>
                      <p className="text-[10px] text-zinc-500 uppercase font-bold mt-0.5 tracking-wider">
                        {tx.type === 'GAVE' ? 'You gave' : 'You got'}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-0 w-full max-w-md bg-white/90 backdrop-blur-xl border-t border-zinc-200/60 shadow-[0_-20px_40px_rgba(0,0,0,0.04)] z-30 pb-8 pt-4 px-4">
        <div className="flex gap-3 mx-auto">
          <button 
            type="button"
            onClick={() => { setTxType('GAVE'); setEditingTxId(null); setAmount(''); setReason(''); setIsAddingTx(true); }}
            className="flex-1 bg-gradient-to-b from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white font-bold py-4 rounded-3xl shadow-lg shadow-rose-500/25 transition-all active:scale-[0.96] flex flex-col items-center justify-center gap-1 border border-rose-400/50"
          >
            <span className="text-xs uppercase tracking-widest opacity-90 font-medium">You Gave</span>
            <span className="text-2xl font-display">₹</span>
          </button>
          <button 
            type="button"
            onClick={() => { setTxType('GOT'); setEditingTxId(null); setAmount(''); setReason(''); setIsAddingTx(true); }}
            className="flex-1 bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold py-4 rounded-3xl shadow-lg shadow-emerald-500/25 transition-all active:scale-[0.96] flex flex-col items-center justify-center gap-1 border border-emerald-400/50"
          >
            <span className="text-xs uppercase tracking-widest opacity-90 font-medium">You Got</span>
            <span className="text-2xl font-display">₹</span>
          </button>
        </div>
      </div>

      {/* Add Transaction Modal */}
      <AnimatePresence>
        {isAddingTx && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-zinc-900/40 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
              className="bg-white w-full max-w-sm rounded-[2.5rem] p-6 shadow-2xl border border-zinc-100"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className={cn(
                  "text-xl font-display font-bold flex items-center gap-2",
                  txType === 'GAVE' ? "text-rose-500" : "text-emerald-600"
                )}>
                  {txType === 'GAVE' ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                  {editingTxId ? 'Edit Transaction' : (txType === 'GAVE' ? `You Gave to ${friend.name}` : `You Got from ${friend.name}`)}
                </h3>
                <button type="button" onClick={closeTxModal} className="p-2 text-zinc-400 hover:bg-zinc-100 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="flex bg-zinc-100 p-1 rounded-xl mb-6">
                  <button
                    type="button"
                    onClick={() => setTxType('GAVE')}
                    className={cn(
                      "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
                      txType === 'GAVE' ? "bg-white text-rose-500 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
                    )}
                  >
                    You Gave
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxType('GOT')}
                    className={cn(
                      "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
                      txType === 'GOT' ? "bg-white text-emerald-600 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
                    )}
                  >
                    You Got
                  </button>
                </div>
                <div className="mb-5">
                  <label className="block text-sm font-bold text-zinc-700 mb-2">Amount (₹)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <IndianRupee className={cn("h-6 w-6", txType === 'GAVE' ? "text-rose-400" : "text-emerald-400")} />
                    </div>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className={cn(
                        "w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none transition-all text-2xl font-extrabold",
                        txType === 'GAVE' ? "focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 text-rose-600" : "focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 text-emerald-600"
                      )}
                      placeholder="0"
                      min="1"
                      step="any"
                      autoFocus
                      required
                    />
                  </div>
                </div>
                <div className="mb-8">
                  <label className="block text-sm font-bold text-zinc-700 mb-2">Details (Optional)</label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium placeholder:text-zinc-400"
                    placeholder="What was this for?"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!amount || parseFloat(amount) <= 0}
                  className={cn(
                    "w-full text-white font-bold py-4 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-lg",
                    txType === 'GAVE' ? "bg-rose-500 hover:bg-rose-600 shadow-rose-500/20" : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                  )}
                >
                  {editingTxId ? 'Update Transaction' : 'Save Transaction'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-zinc-900/50 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-sm rounded-[2.5rem] p-6 shadow-2xl text-center border border-zinc-100"
            >
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-display font-bold text-zinc-900 mb-2">Delete Friend?</h3>
              <p className="text-zinc-500 text-sm mb-8 leading-relaxed">
                Are you sure you want to delete <strong>{friend.name}</strong>? This will permanently erase all transaction history. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold py-3.5 rounded-xl transition-colors active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    onDelete();
                  }}
                  className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold py-3.5 rounded-xl transition-colors active:scale-95 shadow-lg shadow-rose-500/20"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}


