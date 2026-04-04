/**
 * Legacy consultant wallet route.
 * Keep the route alive, but render the hardened commissions/withdrawals flow so
 * older navigation paths cannot bypass the current payout UX.
 */

import ConsultantCommissionsPage from './ConsultantCommissionsPage';

export default function ConsultantWalletPage() {
    return <ConsultantCommissionsPage />;
}
