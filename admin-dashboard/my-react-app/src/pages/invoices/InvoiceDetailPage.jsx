import { useEffect, useState }           from "react"
import { useParams, Link }               from "react-router-dom"
import { ArrowLeft, Printer, Receipt, Calendar, User, Mail, Download, CheckCircle2, AlertCircle, Clock } from "lucide-react"
import { invoicesAPI }                   from "../../libs/api"
import { formatCurrency, formatDate, cn } from "../../libs/utils"
import Spinner                           from "../../components/Spinner"
import { useToast }                      from "../../context/ToastContext"

export default function InvoiceDetailPage() {
  const { id } = useParams()
  const toast  = useToast()
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    invoicesAPI.getById(id)
      .then(({ data }) => setInvoice(data.invoice))
      .catch(() => toast.error("Error", "Invoice not found."))
      .finally(() => setLoading(false))
  }, [id, toast])

  const handlePrint = () => {
    window.print()
  }

  if (loading) return <div className="flex items-center justify-center h-screen bg-black"><Spinner size="xl" /></div>
  if (!invoice) return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-neutral-500">
        <Receipt className="h-16 w-16 mb-4 opacity-20" />
        <h2 className="text-xl font-bold text-white">Invoice Not Found</h2>
        <p className="mt-2 mb-6">The billing record you're looking for doesn't exist.</p>
        <Link to="/invoices" className="px-6 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-bold text-white">Return to Invoices</Link>
    </div>
  )

  const isOverdue = new Date(invoice.dueDate) < new Date() && invoice.status !== "Paid"

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-20">
      
      {/* ── Top Header ── */}
      <div className="flex items-center justify-between mb-10 no-print">
        <div className="flex items-center gap-4">
            <Link to="/invoices" className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-500 hover:text-white transition-all group">
                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Invoice Details</h1>
                <p className="text-sm text-neutral-500 mt-1">Audit and Export Billing Record</p>
            </div>
        </div>
        <div className="flex items-center gap-3">
            <button 
                onClick={handlePrint}
                className="px-5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-bold text-neutral-400 hover:text-white hover:border-neutral-700 transition-all flex items-center gap-2 shadow-sm"
            >
                <Printer className="h-4 w-4" /> Print PDF
            </button>
            <button className="px-6 py-2.5 bg-yellow-500 rounded-xl text-xs font-bold text-black hover:bg-yellow-400 transition-all flex items-center gap-2 shadow-lg shadow-yellow-500/20">
                <Download className="h-4 w-4" /> Export CSV
            </button>
        </div>
      </div>

      {/* ── Invoice Document ── */}
      <div className="bg-neutral-900/40 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl print:bg-white print:text-black print:border-0 print:shadow-none" id="invoice-doc">
        
        {/* Document Header */}
        <div className="p-10 border-b border-neutral-800/50 flex flex-col md:flex-row justify-between items-start gap-8 bg-black/20 print:bg-transparent print:border-neutral-200">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500 flex items-center justify-center font-bold text-black text-xl shadow-lg print:border print:border-neutral-200">Q</div>
                    <span className="text-2xl font-bold text-white tracking-tighter print:text-black uppercase">Queens Fashion Store Luxury</span>
                </div>
                <div className="text-xs font-bold text-neutral-500 leading-relaxed uppercase tracking-widest print:text-neutral-500">
                    Accra, Ghana<br />
                    Premium Lifestyle Hub<br />
                    billing@queensluxury.com
                </div>
            </div>

            <div className="text-right space-y-2">
                <h2 className="text-4xl font-bold text-white tracking-tighter print:text-black">INVOICE</h2>
                <p className="font-mono text-sm text-yellow-500/80 font-bold print:text-neutral-600">{invoice.invoiceNumber || `INV-${invoice._id.slice(-8).toUpperCase()}`}</p>
                <div className={cn(
                    "inline-flex items-center gap-2 px-3 py-1 rounded-lg border text-xs font-bold uppercase tracking-widest mt-4",
                    invoice.status === 'Paid' ? "bg-green-500/10 border-green-500/20 text-green-500 print:bg-green-50 print:text-green-600" : 
                    isOverdue ? "bg-red-500/10 border-red-500/20 text-red-500 print:bg-red-50 print:text-red-600" :
                    "bg-yellow-500/10 border-yellow-500/20 text-yellow-500 print:bg-yellow-50 print:text-yellow-600"
                )}>
                    {invoice.status === 'Paid' ? <CheckCircle2 className="h-3 w-3" /> : isOverdue ? <AlertCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                    {invoice.status} {isOverdue && '(Overdue)'}
                </div>
            </div>
        </div>

        {/* Stakeholders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 p-10 border-b border-neutral-800/50 print:border-neutral-200">
            <div className="space-y-4">
                <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <User className="h-3 w-3" /> Billed To
                </h3>
                <div>
                    <p className="text-2xl font-bold text-white tracking-tight print:text-black">{invoice.customerName}</p>
                    <div className="flex items-center gap-2 text-neutral-500 mt-1.5 print:text-neutral-600">
                        <Mail className="h-3.5 w-3.5" />
                        <span className="text-sm font-medium">{invoice.customerEmail || 'N/A'}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8 text-right md:text-left">
                <div className="space-y-1">
                    <h3 className="text-xs font-bold text-neutral-600 uppercase tracking-widest flex items-center gap-2 justify-end md:justify-start">
                        <Calendar className="h-3 w-3" /> Date Issued
                    </h3>
                    <p className="text-sm font-bold text-neutral-300 print:text-black">{formatDate(invoice.issuedDate || invoice.createdAt)}</p>
                </div>
                <div className="space-y-1">
                    <h3 className="text-xs font-bold text-neutral-600 uppercase tracking-widest flex items-center gap-2 justify-end md:justify-start">
                        <Clock className="h-3 w-3" /> Due Date
                    </h3>
                    <p className={cn(
                        "text-sm font-bold",
                        isOverdue ? "text-red-500" : "text-neutral-300 print:text-black"
                    )}>{formatDate(invoice.dueDate)}</p>
                </div>
            </div>
        </div>

        {/* Items Table */}
        <div className="p-10">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-neutral-800 print:border-neutral-300">
                        <th className="py-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-widest">Item Description</th>
                        <th className="py-4 text-center text-xs font-bold text-neutral-500 uppercase tracking-widest">Quantity</th>
                        <th className="py-4 text-right text-xs font-bold text-neutral-500 uppercase tracking-widest">Unit Price</th>
                        <th className="py-4 text-right text-xs font-bold text-neutral-500 uppercase tracking-widest">Extended</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/50 print:divide-neutral-100">
                    {invoice.items?.map((item, i) => (
                        <tr key={i} className="group hover:bg-white/[0.01] transition-colors">
                            <td className="py-6">
                                <p className="font-bold text-white print:text-black mb-1">{item.title}</p>
                                <p className="text-xs font-mono text-neutral-600 uppercase">{item.SKU}</p>
                            </td>
                            <td className="py-6 text-center text-neutral-400 print:text-black font-medium">{item.quantity}</td>
                            <td className="py-6 text-right text-neutral-400 print:text-black font-medium">{formatCurrency(item.price)}</td>
                            <td className="py-6 text-right font-bold text-white print:text-black">{formatCurrency(item.lineTotal)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Calculations Section */}
            <div className="mt-10 flex justify-end">
                <div className="w-full md:w-80 space-y-4 pt-10 border-t border-neutral-800 print:border-neutral-300">
                    <div className="flex justify-between text-neutral-500 print:text-neutral-600">
                        <span className="text-xs font-bold uppercase tracking-widest">Gross Subtotal</span>
                        <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
                    </div>
                    {invoice.discount > 0 && (
                        <div className="flex justify-between text-green-500">
                            <span className="text-xs font-bold uppercase tracking-widest">Store Credits / Promo</span>
                            <span className="font-medium">-{formatCurrency(invoice.discount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-neutral-500 print:text-neutral-600">
                        <span className="text-xs font-bold uppercase tracking-widest">Logistics / Handling</span>
                        <span className="font-medium">{formatCurrency(invoice.shippingCharge || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center bg-black/40 border border-neutral-800 rounded-2xl p-6 mt-6 print:bg-neutral-50 print:border-neutral-200">
                        <span className="text-xs font-bold text-white uppercase tracking-[0.2em] print:text-black">Balance Due</span>
                        <span className="text-2xl font-bold text-yellow-500 tracking-tighter print:text-black">{formatCurrency(invoice.amount)}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Note / Footer */}
        {invoice.notes && (
            <div className="m-10 p-6 bg-black/40 border border-neutral-800 rounded-2xl print:bg-transparent print:border-0 print:border-t print:border-neutral-100">
                <h4 className="text-xs font-bold text-neutral-600 uppercase tracking-widest mb-2">Internal Remarks</h4>
                <p className="text-xs text-neutral-400 leading-relaxed font-medium print:text-neutral-600">{invoice.notes}</p>
            </div>
        )}

        <div className="p-10 bg-black/20 border-t border-neutral-800/50 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-neutral-700 uppercase tracking-[0.3em] print:hidden">
            <span>Powered by Queens Fashion Store Secure Billing</span>
            <span>Ref: {invoice._id}</span>
        </div>
      </div>

      <style>{`
        @media print {
            body * { visibility: hidden; background: white !important; }
            #invoice-doc, #invoice-doc * { visibility: visible; }
            #invoice-doc { 
                position: absolute; 
                left: 0; 
                top: 0; 
                width: 100%; 
                background-color: white !important;
                color: black !important;
            }
            .no-print { display: none !important; }
        }
      `}</style>
    </div>
  )
}
