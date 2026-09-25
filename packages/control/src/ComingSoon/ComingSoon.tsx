import React from 'react'
import { Card } from 'primereact/card';
// import { Button } from 'primereact/button';

type Props = {}

const ComingSoon = (props: Props) => {
  return (
    <div className='h-full w-full relative'>
      <div className="absolute top-50 left-50 relative text-center" style={{ transform: 'translate(-50%,-50%)' }}>
        <Card className='center-content' title="UNDER CONSTRUCTION" style={{ width: '35rem', marginBottom: '2em' }}>
          <img src="./assets/img/under-construction.png" alt=""
            className="comming-soon-image" ></img>
        </Card>
      </div>
    </div>
  )
}

export default ComingSoon