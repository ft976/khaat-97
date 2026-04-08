export type TransactionType = 'GAVE' | 'GOT';

export interface Transaction {
  id: string;
  amount: number;
  reason: string;
  type: TransactionType;
  date: string;
}

export interface Friend {
  id: string;
  name: string;
  balance: number; // Positive means they owe you (You will get), Negative means you owe them (You will give)
  transactions: Transaction[];
}
