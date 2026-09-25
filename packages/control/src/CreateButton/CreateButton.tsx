import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from 'primereact/button';

type Props = {
    to: string,
    label: string,
    col?: number,
    disabled?: boolean,
    state?: any
}

const CreateButton = ({ to, label, col, disabled = false, state }: Props) => {
    return (
        <div
            className={`field col-${col || 6}`}
            style={{ marginLeft: 'auto', display: 'flex', height: 55 }}
        >
            <Link
                to={to}
                state={state}
                style={{ textDecoration: "none", marginLeft: 'auto', display: 'flex', pointerEvents: disabled ? 'none' : 'auto' }} >
                <Button disabled={disabled} label={`Create ${label}`} />
            </Link>
        </div>
    )
}

export default CreateButton