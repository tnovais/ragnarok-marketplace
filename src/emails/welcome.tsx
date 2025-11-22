import * as React from 'react';

interface WelcomeEmailProps {
    name: string;
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({ name }) => (
    <div>
        <h1>Welcome, {name}!</h1>
        <p>Thank you for joining Ragnarok TradeHub.</p>
        <p>Start trading safely today!</p>
    </div>
);
