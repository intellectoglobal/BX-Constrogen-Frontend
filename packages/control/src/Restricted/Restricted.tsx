import React from 'react'
import { Card } from 'primereact/card';
import { classNames } from 'primereact/utils';

type Props = {
    relative?: boolean
}

const NoMatch = ({ relative }: Props) => {
    return (
        <div className={classNames('h-full w-full', relative && 'relative')}>
            <div className={classNames("absolute top-50 left-50 text-center", relative && 'relative')} style={{ transform: 'translate(-50%,-50%)' }}>
                <Card className={classNames(relative && 'center-content')} title="Access Denied!" style={{ width: '25rem', marginBottom: '2em' }}>
                    <img src="./assets/img/restricted.png" alt=""
                        className="comming-soon-image" ></img>
                </Card>
            </div>
        </div>
    )
}

export default NoMatch