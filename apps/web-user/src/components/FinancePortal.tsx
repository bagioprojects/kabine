import React, { useState } from 'react';
import { CreditCard, Landmark, DollarSign, ArrowLeftRight, TrendingUp, FileText, CheckCircle2 } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface FinancePortalProps {
  balances: {
    cash: number;
    bankCheckingBalance: number;
    bankSavingsBalance: number;
    creditScore: number;
    activeLoanDebt: number;
    taxDebt: number;
  };
  onUpdateBalances: (newBalances: Partial<FinancePortalProps['balances']>, log: string) => void;
}

export const FinancePortal: React.FC<FinancePortalProps> = ({ balances, onUpdateBalances }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'transfer' | 'loans'>('summary');
  const [transferAmount, setTransferAmount] = useState<string>('');
  const [transferType, setTransferType] = useState<'deposit' | 'withdraw'>('deposit'); // to savings
  const [loanAmount, setLoanAmount] = useState<string>('');
  const [taxAmount, setTaxAmount] = useState<string>('');
  const [message, setMessage] = useState<{ text: string; success: boolean } | null>(null);

  const showMsg = (text: string, success: boolean) => {
    setMessage({ text, success });
    setTimeout(() => setMessage(null), 4000);
  };

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val);
  };

  // Deposit/Withdraw to Savings
  const handleSavingsTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(transferAmount);
    if (isNaN(amt) || amt <= 0) {
      showMsg('Geçersiz tutar girdiniz.', false);
      return;
    }

    if (transferType === 'deposit') {
      if (balances.bankCheckingBalance < amt) {
        showMsg('Vadesiz hesabınızda yeterli bakiye yok!', false);
        return;
      }
      onUpdateBalances({
        bankCheckingBalance: balances.bankCheckingBalance - amt,
        bankSavingsBalance: balances.bankSavingsBalance + amt
      }, `${formatMoney(amt)} vadeli hesaba yatırıldı.`);
      showMsg('Tasarruf hesabınıza para aktarıldı.', true);
    } else {
      if (balances.bankSavingsBalance < amt) {
        showMsg('Vadeli hesabınızda yeterli bakiye yok!', false);
        return;
      }
      onUpdateBalances({
        bankCheckingBalance: balances.bankCheckingBalance + amt,
        bankSavingsBalance: balances.bankSavingsBalance - amt
      }, `${formatMoney(amt)} vadesiz hesaba çekildi.`);
      showMsg('Vadesiz hesabınıza para çekildi.', true);
    }
    setTransferAmount('');
  };

  // Pay Tax Debt
  const handlePayTax = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(taxAmount);
    if (isNaN(amt) || amt <= 0) {
      showMsg('Geçersiz tutar girdiniz.', false);
      return;
    }
    if (balances.bankCheckingBalance < amt) {
      showMsg('Vadesiz hesabınızda yeterli bakiye yok!', false);
      return;
    }
    if (balances.taxDebt < amt) {
      showMsg('Girdiğiniz tutar toplam vergi borcunuzdan fazla!', false);
      return;
    }

    onUpdateBalances({
      bankCheckingBalance: balances.bankCheckingBalance - amt,
      taxDebt: balances.taxDebt - amt,
      creditScore: Math.min(850, balances.creditScore + 15) // Paying taxes raises credit score
    }, `${formatMoney(amt)} vergi borcu ödendi.`);
    showMsg('Vergi borcunuz başarıyla ödendi. Kredi notunuz arttı!', true);
    setTaxAmount('');
  };

  // Request Loan
  const handleRequestLoan = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(loanAmount);
    if (isNaN(amt) || amt <= 0) {
      showMsg('Geçersiz tutar girdiniz.', false);
      return;
    }

    // Maximum loan calculated based on credit score
    const maxLoanLimit = balances.creditScore * 50; 
    if (balances.activeLoanDebt + amt > maxLoanLimit) {
      showMsg(`Kredi limitiniz aşıldı! Maksimum kredi limitiniz: ${formatMoney(maxLoanLimit)}`, false);
      return;
    }

    onUpdateBalances({
      bankCheckingBalance: balances.bankCheckingBalance + amt,
      activeLoanDebt: balances.activeLoanDebt + amt,
      creditScore: Math.max(300, balances.creditScore - 10) // Taking loans temporarily decreases score
    }, `${formatMoney(amt)} değerinde devlet kredisi çekildi.`);
    showMsg('Krediniz onaylandı ve vadesiz hesabınıza aktarıldı.', true);
    setLoanAmount('');
  };

  // Pay Loan
  const handlePayLoan = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(loanAmount);
    if (isNaN(amt) || amt <= 0) {
      showMsg('Geçersiz tutar girdiniz.', false);
      return;
    }
    if (balances.bankCheckingBalance < amt) {
      showMsg('Vadesiz hesabınızda yeterli bakiye yok!', false);
      return;
    }
    if (balances.activeLoanDebt < amt) {
      showMsg('Ödemek istediğiniz tutar toplam kredi borcunuzdan fazla!', false);
      return;
    }

    onUpdateBalances({
      bankCheckingBalance: balances.bankCheckingBalance - amt,
      activeLoanDebt: balances.activeLoanDebt - amt,
      creditScore: Math.min(850, balances.creditScore + 20) // Paying loans increases score
    }, `${formatMoney(amt)} kredi borcu geri ödendi.`);
    showMsg('Kredi borcunuz başarıyla ödendi. Kredi notunuz güncellendi!', true);
    setLoanAmount('');
  };

  return (
    <GlassCard style={{ borderLeft: '4px solid hsl(var(--accent-purple))' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
          <span>🏛️</span> Merkez Bankası & Finans Portalı
        </h2>
        
        {/* Sub Navigation */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '0.25rem', border: '1px solid rgba(255,255,255,0.05)' }}>
          <button 
            className={activeTab === 'summary' ? 'btn-primary' : 'btn-secondary'} 
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', borderRadius: '6px' }}
            onClick={() => setActiveTab('summary')}
          >
            Özet
          </button>
          <button 
            className={activeTab === 'transfer' ? 'btn-primary' : 'btn-secondary'} 
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', borderRadius: '6px' }}
            onClick={() => setActiveTab('transfer')}
          >
            Vadeli Hesap
          </button>
          <button 
            className={activeTab === 'loans' ? 'btn-primary' : 'btn-secondary'} 
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', borderRadius: '6px' }}
            onClick={() => setActiveTab('loans')}
          >
            Kredi & Vergi
          </button>
        </div>
      </div>

      {message && (
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          background: message.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${message.success ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
          color: message.success ? 'hsl(var(--accent-emerald))' : 'hsl(var(--accent-red))',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.9rem'
        }}>
          <CheckCircle2 size={16} />
          <span>{message.text}</span>
        </div>
      )}

      {/* Tab: Summary */}
      {activeTab === 'summary' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          
          {/* Checking Card */}
          <GlassCard style={{ 
            background: 'rgba(255,255,255,0.02)', 
            padding: '1rem',
            borderLeft: '3px solid hsl(var(--accent-cyan))',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(var(--accent-cyan))', fontSize: '0.8rem', fontWeight: 600 }}>
                <CreditCard size={15} /> VADESİZ HESAP (CHECKING)
              </div>
              <div className="status-dot pulsing" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'hsl(var(--accent-cyan))', boxShadow: '0 0 6px hsl(var(--accent-cyan))' }} />
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, marginTop: '0.75rem', color: 'white', fontFamily: 'monospace', letterSpacing: '0.02em' }}>
              {formatMoney(balances.bankCheckingBalance)}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'hsl(var(--text-muted))', marginTop: '0.25rem' }}>EFT / Havale İşlemlerine Açık</div>
          </GlassCard>

          {/* Savings Card */}
          <GlassCard style={{ 
            background: 'rgba(255,255,255,0.02)', 
            padding: '1rem',
            borderLeft: '3px solid hsl(var(--accent-emerald))',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(var(--accent-emerald))', fontSize: '0.8rem', fontWeight: 600 }}>
                <Landmark size={15} /> VADELİ MEVDUAT (SAVINGS)
              </div>
              <div className="status-dot pulsing" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'hsl(var(--accent-emerald))', boxShadow: '0 0 6px hsl(var(--accent-emerald))' }} />
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, marginTop: '0.75rem', color: 'hsl(var(--accent-emerald))', fontFamily: 'monospace', letterSpacing: '0.02em' }}>
              {formatMoney(balances.bankSavingsBalance)}
            </div>
            <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', display: 'block', marginTop: '0.25rem' }}>Günlük Faiz Getirisi: <strong style={{ color: 'white' }}>%0.05</strong></span>
          </GlassCard>

          {/* Cash Card */}
          <GlassCard style={{ 
            background: 'rgba(255,255,255,0.02)', 
            padding: '1rem',
            borderLeft: '3px solid hsl(var(--accent-gold))',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(var(--accent-gold))', fontSize: '0.8rem', fontWeight: 600 }}>
                <DollarSign size={15} /> NAKİT CÜZDAN (CASH)
              </div>
              <div className="status-dot pulsing" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'hsl(var(--accent-gold))', boxShadow: '0 0 6px hsl(var(--accent-gold))' }} />
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, marginTop: '0.75rem', color: 'hsl(var(--accent-gold))', fontFamily: 'monospace', letterSpacing: '0.02em' }}>
              {formatMoney(balances.cash)}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'hsl(var(--text-muted))', marginTop: '0.25rem' }}>Fiziki Harcamalarda Kullanılabilir</div>
          </GlassCard>

          {/* Credit Score Card */}
          <GlassCard style={{ 
            background: 'rgba(255,255,255,0.02)', 
            padding: '1rem',
            borderLeft: '3px solid hsl(var(--accent-purple))',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(var(--accent-purple))', fontSize: '0.8rem', fontWeight: 600 }}>
                <TrendingUp size={15} /> KREDİ NOTU (SCORE)
              </div>
              <span style={{ 
                fontSize: '0.65rem', 
                background: balances.creditScore > 650 ? 'rgba(6, 182, 212, 0.15)' : 'rgba(245, 158, 11, 0.15)', 
                color: balances.creditScore > 650 ? 'hsl(var(--accent-cyan))' : 'hsl(var(--accent-gold))',
                padding: '0.1rem 0.35rem',
                borderRadius: '4px',
                fontWeight: 700
              }}>
                {balances.creditScore > 650 ? 'GÜVENİLİR' : 'RİSKLİ'}
              </span>
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, marginTop: '0.75rem', color: balances.creditScore > 650 ? 'hsl(var(--accent-cyan))' : 'hsl(var(--accent-gold))', fontFamily: 'monospace', letterSpacing: '0.02em' }}>
              {balances.creditScore} <span style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>/ 850</span>
            </div>
            <div style={{ 
              height: '4px', 
              background: 'rgba(255,255,255,0.05)', 
              borderRadius: '2px', 
              marginTop: '0.5rem', 
              overflow: 'hidden' 
            }}>
              <div style={{ 
                height: '100%', 
                width: `${(balances.creditScore / 850) * 100}%`, 
                background: 'linear-gradient(90deg, hsl(var(--accent-purple)) 0%, hsl(var(--accent-cyan)) 100%)',
                boxShadow: '0 0 6px hsl(var(--accent-cyan))'
              }} />
            </div>
          </GlassCard>
        </div>
      )}

      {/* Tab: Transfer / Savings Management */}
      {activeTab === 'transfer' && (
        <form onSubmit={handleSavingsTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>İşlem Türü</label>
              <select value={transferType} onChange={(e) => setTransferType(e.target.value as any)}>
                <option value="deposit">Vadesizden Vadeliye Yatır (Deposit)</option>
                <option value="withdraw">Vadeliden Vadesize Çek (Withdraw)</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>Tutar (₺)</label>
              <input 
                type="number" 
                placeholder="Örn: 250" 
                value={transferAmount} 
                onChange={(e) => setTransferAmount(e.target.value)} 
              />
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <ArrowLeftRight size={18} />
            <span>İşlemi Tamamla</span>
          </button>
        </form>
      )}

      {/* Tab: Loans & Taxes */}
      {activeTab === 'loans' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {/* Loan panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Landmark size={18} /> Kredi İşlemleri
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>
                Aktif Kredi Borcu: <strong style={{ color: 'hsl(var(--accent-red))' }}>{formatMoney(balances.activeLoanDebt)}</strong>
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>Tutar (₺)</label>
              <input 
                type="number" 
                placeholder="Örn: 1000" 
                value={loanAmount} 
                onChange={(e) => setLoanAmount(e.target.value)} 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button onClick={handleRequestLoan} className="btn-success" style={{ padding: '0.6rem' }}>
                Kredi Çek
              </button>
              <button onClick={handlePayLoan} className="btn-secondary" style={{ padding: '0.6rem' }}>
                Borç Öde
              </button>
            </div>
          </div>

          {/* Tax panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={18} /> Maliye Vergi Borcu
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>
                Birikmiş Vergi: <strong style={{ color: 'hsl(var(--accent-red))' }}>{formatMoney(balances.taxDebt)}</strong>
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>Tutar (₺)</label>
              <input 
                type="number" 
                placeholder="Örn: 150" 
                value={taxAmount} 
                onChange={(e) => setTaxAmount(e.target.value)} 
              />
            </div>

            <button onClick={handlePayTax} className="btn-primary" style={{ padding: '0.6rem', marginTop: 'auto' }}>
              Vergi Öde
            </button>
          </div>
        </div>
      )}
    </GlassCard>
  );
};
