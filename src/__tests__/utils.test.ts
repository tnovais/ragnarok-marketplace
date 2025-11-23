import { describe, it, expect } from 'vitest';
import { formatCurrency, cn } from '@/lib/utils';

describe('Utils', () => {
    describe('formatCurrency', () => {
        it('should format number as BRL currency', () => {
            const result = formatCurrency(1000);
            // Non-breaking space might be present, so we check for parts
            expect(result).toContain('R$');
            expect(result).toContain('1.000,00');
        });

        it('should format string number as BRL currency', () => {
            const result = formatCurrency("50.50");
            expect(result).toContain('R$');
            expect(result).toContain('50,50');
        });
    });

    describe('cn', () => {
        it('should merge class names', () => {
            const result = cn('c1', 'c2');
            expect(result).toBe('c1 c2');
        });

        it('should handle conditional classes', () => {
            const result = cn('c1', false && 'c2', 'c3');
            expect(result).toBe('c1 c3');
        });

        it('should merge tailwind classes', () => {
            const result = cn('p-4', 'p-2');
            expect(result).toBe('p-2');
        });
    });
});
