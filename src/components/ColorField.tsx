export const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

/** A color picker paired with a hex field, so admins can pick or paste a value. */
function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (hex: string) => void }) {
    const valid = HEX_COLOR.test(value);
    return (
        <div className="cc-field">
            <span className="cc-label">{label}</span>
            <div className="cc-color">
                <input
                    type="color"
                    aria-label={`${label} picker`}
                    value={valid ? value : '#000000'}
                    onChange={(e) => onChange(e.target.value.toUpperCase())}
                />
                <input
                    aria-label={label}
                    aria-invalid={!valid}
                    value={value}
                    maxLength={7}
                    spellCheck={false}
                    onChange={(e) => onChange(e.target.value.toUpperCase())}
                />
            </div>
        </div>
    );
}

export default ColorField;
