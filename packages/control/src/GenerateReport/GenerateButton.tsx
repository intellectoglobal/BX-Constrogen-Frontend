import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from 'primereact/button';

type Props = {
    onClick : any,
    label: string,
    col?: number,
    disabled?: boolean,
}

const GenerateButton = ({ label, col, disabled = false, onClick = () => {} }: Props) => {
    return (
        <div
            className={`field col-${col || 6}`}
            style={{ marginLeft: 'auto', display: 'flex', height: 50 }}
        >
            <Button
                onClick={onClick}
                style={{ marginLeft: 'auto', display: 'flex' }}
                disabled={disabled}
                label={`${label}`}
            />
        </div>
    )
}

export default GenerateButton