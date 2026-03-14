import { useMemo } from 'react';
import { Check, X } from 'lucide-react';

function getValidationRules(password) {
  return [
    { label: 'At least 8 characters', passed: password.length >= 8 },
    { label: 'One uppercase letter (A–Z)', passed: /[A-Z]/.test(password) },
    { label: 'One lowercase letter (a–z)', passed: /[a-z]/.test(password) },
    { label: 'One number (0–9)', passed: /[0-9]/.test(password) },
    {
      label: 'One special character (!@#$%^&*()_+-=)',
      passed: /[!@#$%^&*()_+\-=]/.test(password),
    },
  ];
}

export default function PasswordValidator({ password }) {
  const rules = useMemo(() => getValidationRules(password), [password]);

  if (!password) return null;

  return (
    <div className="mt-3">
      <ul className="grid gap-1.5">
        {rules.map((rule) => (
          <li
            key={rule.label}
            className={`flex items-center gap-2 text-xs font-medium transition-colors duration-300 ${
              rule.passed ? 'text-emerald-400' : 'text-gray-500'
            }`}
          >
            <span
              className={`flex items-center justify-center w-4 h-4 rounded-full transition-all duration-300 ${
                rule.passed
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/10 text-red-400'
              }`}
            >
              {rule.passed ? <Check size={10} strokeWidth={3} /> : <X size={10} strokeWidth={3} />}
            </span>
            {rule.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Utility hook — returns true when all 5 rules pass */
export function usePasswordValid(password) {
  return useMemo(() => {
    const rules = getValidationRules(password);
    return rules.every((r) => r.passed);
  }, [password]);
}
