import React from "react";
import { adminListBookings, adminListOrders } from "../../lib/api";
import type { Booking, Order } from "../../types";
import { Link } from "react-router-dom";

// Helper function to get the date string for a specific day offset from today
const getDateString = (offsetDays: number): string => {
    const d = new Date();
    d.setDate(d.getDate() - offsetDays);
    return d.toISOString().split('T')[0];
};

// Helper to get a date string from a base date, offsetting by given days
const offsetDate = (baseDate: Date, offsetDays: number): string => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
};

// Stat Component
const Stat: React.FC<{ label: string; value: string; sub?: string; color?: string }> = ({ label, value, sub, color }) => (
  <div className="bg-white p-6 border border-stone-200 shadow-md">
    <div className="text-sm text-stone-600 uppercase tracking-wider">{label}</div>
    <div className={`text-3xl font-serif font-bold mt-1 ${color || 'text-zinc-900'}`}>{value}</div>
    {sub && <div className="text-xs text-stone-500 mt-1">{sub}</div>}
  </div>
);

// Helper function to safely get room title
const getRoomTitle = (room: Booking['room']) => {
    if (typeof room === 'string') return 'Room ID: ' + room.substring(0, 4);
    return room?.title || 'Unknown Room';
};


const AdminDashboard: React.FC = () => {
    const [bookings, setBookings] = React.useState<Booking[]>([]);
    const [orders, setOrders] = React.useState<Order[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    
    // State for dynamic date selection (Defaults to today)
    const [reportEndDate, setReportEndDate] = React.useState(getDateString(0));
    
    // Base Date object derived from the state string
    const reportBaseDate = React.useMemo(() => new Date(reportEndDate), [reportEndDate]);

    // --- Dynamic Range Calculation ---
    const getDynamicRanges = (base: Date) => {
        // Range 1: The 7-day period ending on 'base' date (e.g., if base is Nov 19, range is Nov 13-19)
        const currentEnd = offsetDate(base, 1); // Exclusive end date (midnight after the base date)
        const currentStart = offsetDate(base, -6); // Inclusive start date (7 days before end)
        
        // Range 2: The 7-day period immediately preceding Range 1 (e.g., Nov 6-12)
        const prevEnd = currentStart;
        const prevStart = offsetDate(base, -13);

        // Daily Check-in/Out target date (the selected day)
        const dailyTarget = base.toISOString().split('T')[0];

        return { currentStart, currentEnd, prevStart, prevEnd, dailyTarget };
    };
    
    const ranges = getDynamicRanges(reportBaseDate);

    React.useEffect(() => {
        (async () => {
            try {
                setError(null);
                const [b, o] = await Promise.all([adminListBookings(), adminListOrders()]);
                setBookings(Array.isArray(b) ? b : []);
                setOrders(Array.isArray(o) ? o : []);
            } catch (e: any) {
                setError(e?.response?.data?.error || "Failed to load admin dashboard");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) return <p>Loading…</p>;
    if (error) return <p className="text-red-600">{error}</p>;

    // --- Data Calculation Helpers ---
    const calculateOrderTotal = (o: Order) => (o.total ?? o.items.reduce((x: number, i: any) => x + i.price * i.quantity, 0));

    // Safely checks if a timestamp falls within a 7-day range
    const isInRange = (timestamp: string | undefined, startRange: string, endRange: string) => {
        if (!timestamp) return false;
        const date = new Date(timestamp).toISOString().split('T')[0];
        // Checks if date is >= start (inclusive) AND < end (exclusive)
        return date >= startRange && date < endRange; 
    };

    // Calculate all-time paid revenue
    const totalRevenuePaid = orders
        .filter((ord: Order) => ord.paid)
        .reduce((s: number, o: Order) => s + calculateOrderTotal(o), 0);

    // Dynamic Range Filtering Functions
    const getCurrentRevenue = (rangeStart: string, rangeEnd: string) => orders
        .filter((o: Order) => o.paid && o.paidAt && isInRange(o.paidAt, rangeStart, rangeEnd))
        .reduce((s: number, o: Order) => s + calculateOrderTotal(o), 0);
        
    const getCurrentBookings = (rangeStart: string, rangeEnd: string) => bookings
        .filter((b: Booking) => b.status !== 'Declined' && b.status !== 'Cancelled' && b.createdAt?.startsWith && isInRange(b.createdAt, rangeStart, rangeEnd)).length;


    const revenueCurrentPeriod = getCurrentRevenue(ranges.prevEnd, ranges.currentEnd);
    const revenuePreviousPeriod = getCurrentRevenue(ranges.prevStart, ranges.prevEnd);

    const newBookingsCurrentPeriod = getCurrentBookings(ranges.prevEnd, ranges.currentEnd);
    const newBookingsPreviousPeriod = getCurrentBookings(ranges.prevStart, ranges.prevEnd);


    // --- Real-Time Order Queue (Always based on current live data, not historical date picker) ---
    const activeOrders = orders.filter((o: Order) => ["Received", "Preparing", "Ready"].includes(o.status));
    const criticalOrders = activeOrders.filter((o: Order) => ["Ready", "Preparing"].includes(o.status));
    const totalCriticalItems = criticalOrders.reduce((sum: number, o: Order) => sum + o.items.length, 0);

    // --- Daily Check-in/Out (Targeted at selected day) ---
    const pendingBookings = bookings.filter((b: Booking) => b.status === "Pending").length;
    
    const targetCheckIns = bookings.filter((b: Booking) => b.status === 'Confirmed' && b.checkIn?.startsWith(ranges.dailyTarget)).length;
    const targetCheckOuts = bookings.filter((b: Booking) => b.status === 'Checked-in' && b.checkOut?.startsWith(ranges.dailyTarget)).length;
    
    
    const ComparativeStat: React.FC<{ 
        label: string; 
        value: number; 
        comparisonValue: number; 
        total: number;
        currency?: boolean; 
        color?: string 
    }> = ({ label, value, comparisonValue, total, currency, color }) => {
        const diff = value - comparisonValue;
        const isRevenue = currency;
        
        const diffText = diff === 0 
            ? 'No change from prior 7 days' 
            : diff > 0 
            ? `+${isRevenue ? '$' : ''}${Math.abs(diff).toLocaleString()} vs. prior 7 days` 
            : `-${isRevenue ? '$' : ''}${Math.abs(diff).toLocaleString()} vs. prior 7 days`;

        const diffColor = diff === 0 ? 'text-stone-500' : diff > 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold';

        const fmt = (n: number) => isRevenue ? `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : String(n);

        return (
            <div className="bg-white p-6 border border-stone-200 shadow-md">
                <div className="text-sm text-stone-600 uppercase tracking-wider">{label}</div>
                
                <div className={`text-4xl font-serif font-bold mt-1 ${color || 'text-zinc-900'}`}>{fmt(value)}</div>
                
                <div className="text-xs text-stone-500 mt-1">
                    <span className={diffColor}>{diffText}</span>
                </div>
                
                <div className="text-xs text-stone-500 mt-2 pt-2 border-t border-stone-100">
                    <span className="font-semibold">Overall Total:</span> {fmt(total)}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <h1 className="font-serif text-3xl font-bold text-zinc-800">Operational Command Center</h1>
            
            {/* --- Date Picker for Historical Context --- */}
            <div className="flex items-center gap-4 p-4 border border-stone-300 bg-white shadow-md">
                <label className="text-sm font-semibold text-zinc-800 uppercase tracking-wider">Report End Date:</label>
                <input
                    type="date"
                    value={reportEndDate}
                    onChange={(e) => setReportEndDate(e.target.value)}
                    className="border border-stone-300 px-3 py-2 text-base"
                    max={getDateString(0)}
                />
                 <span className="text-xs text-stone-600 ml-4">
                     Showing 7-day period ending on {new Date(reportEndDate).toLocaleDateString()}
                 </span>
            </div>

            
            {/* --- 1. Top Level KPIs (Financial & Capacity) --- */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                
                {/* Revenue Comparison (Last 7 Days vs Previous 7 Days) */}
                <ComparativeStat 
                    label="Revenue Settled (Last 7 Days)" 
                    value={revenueCurrentPeriod} 
                    comparisonValue={revenuePreviousPeriod}
                    total={totalRevenuePaid}
                    currency={true}
                    color="text-yellow-500"
                />

                {/* New Bookings Comparison (Last 7 Days vs Previous 7 Days) */}
                <ComparativeStat 
                    label="New Reservations (Last 7 Days)" 
                    value={newBookingsCurrentPeriod} 
                    comparisonValue={newBookingsPreviousPeriod}
                    total={bookings.length}
                    currency={false}
                    color="text-zinc-900"
                />
                
                {/* Daily Check-ins (Targeted Date) */}
                <Stat 
                    label={`Confirmed Arrivals (${ranges.dailyTarget})`} 
                    value={String(targetCheckIns)} 
                    sub="Confirmed guests checking in"
                    color="text-green-600"
                />

                {/* Daily Check-outs (Targeted Date) */}
                <Stat 
                    label={`Guest Departures (${ranges.dailyTarget})`} 
                    value={String(targetCheckOuts)} 
                    sub="Guests finalizing their stay"
                    color="text-red-600"
                />
            </div>

            {/* --- 2. Real-Time Service Queue (Always Live Data) --- */}
            <h2 className="text-xl font-serif font-bold text-zinc-800 pt-4 border-t border-stone-200">Real-Time Service Queue (LIVE)</h2>
            
            <div className="grid lg:grid-cols-2 gap-6">
                
                {/* A. In-Room Dining Status (Always Live) */}
                <div className="bg-white p-6 border border-stone-200 shadow-xl space-y-4">
                    <h3 className="text-lg font-semibold flex justify-between items-center">
                        In-Room Dining (Active Queue)
                        <span className={`px-3 py-1 text-sm font-bold ${totalCriticalItems > 0 ? 'bg-yellow-500 text-zinc-900' : 'bg-green-100 text-green-700'}`}>
                            {criticalOrders.length} Orders / {totalCriticalItems} Items
                        </span>
                    </h3>
                    
                    {criticalOrders.length > 0 ? (
                        <ul className="space-y-2">
                            {criticalOrders.slice(0, 5).map((o: Order) => (
                                <li key={o._id} className="p-3 border border-yellow-300 bg-yellow-50 flex justify-between items-center">
                                    <div>
                                        <span className="font-semibold">{o.roomNumber}</span>
                                        <span className="text-sm text-stone-600 ml-2">({o.items.length} items)</span>
                                    </div>
                                    <span className="text-sm font-bold text-amber-700">{o.status}</span>
                                </li>
                            ))}
                            {activeOrders.length > 5 && <li className="text-sm text-stone-500 text-center">... {activeOrders.length - 5} more orders</li>}
                        </ul>
                    ) : (
                        <p className="text-stone-500 italic">No critical orders currently preparing or ready for dispatch.</p>
                    )}
                    
                    <Link to="/admin/orders" className="text-sm font-semibold text-blue-700 hover:underline block pt-2 border-t border-stone-100">
                        Manage All Orders →
                    </Link>
                </div>
                
                {/* B. Upcoming Service Needs (Always Live) */}
                <div className="bg-white p-6 border border-stone-200 shadow-xl space-y-4">
                    <h3 className="text-lg font-semibold flex justify-between items-center">
                        Pending Reservations (Manual Review)
                        <span className="text-sm text-stone-500">{pendingBookings} to Confirm</span>
                    </h3>

                    {bookings.filter((b: Booking) => b.status === "Pending").slice(0, 5).map((b: Booking) => (
                        <div key={b._id} className="p-3 border border-stone-300 flex justify-between items-center">
                            <span className="font-semibold text-sm">{getRoomTitle(b.room)}</span>
                            <span className="text-xs text-stone-600 ml-2">Check-in: {new Date(b.checkIn).toLocaleDateString()}</span>
                            <span className="text-sm text-amber-700">Pending</span>
                        </div>
                    ))}
                    
                    <Link to="/admin/bookings" className="text-sm font-semibold text-blue-700 hover:underline block pt-2 border-t border-stone-100">
                        Review Bookings & Guests →
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;