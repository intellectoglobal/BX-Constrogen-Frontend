import React from 'react'
import { ProgressSpinner } from 'primereact/progressspinner';

type Props = {}

const Loader = (props: Props) => {
    return (
        <div className='h-full w-full'>
            <div className="card absolute top-50 left-50" style={{ transform: 'translate(-50%,-50%)' }}>
                <ProgressSpinner />
            </div>
        </div>
    )
}

export default Loader