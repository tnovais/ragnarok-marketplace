import { describe, it, expect } from 'vitest';
import { sanitize } from './sanitize';

describe('Sanitization Utility', () => {
    it('should remove script tags', () => {
        const input = 'Hello <script>alert("xss")</script>';
        const output = sanitize(input);
        expect(output).toBe('Hello ');
    });

    it('should keep safe HTML', () => {
        const input = '<b>Bold</b> and <i>Italic</i>';
        const output = sanitize(input);
        expect(output).toBe('<b>Bold</b> and <i>Italic</i>');
    });

    it('should remove onclick attributes', () => {
        const input = '<button onclick="stealData()">Click me</button>';
        const output = sanitize(input);
        expect(output).toBe('<button>Click me</button>');
    });
});
