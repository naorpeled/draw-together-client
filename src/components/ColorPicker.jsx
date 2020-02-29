import React from 'react'

export default function ColorPicker({color, clickListener}) {
    return (
        <div className="color" style={{backgroundColor: color}} onClick={() => clickListener(color)}>
        </div>
    )
}
