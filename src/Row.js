import React, { Component, Fragment } from 'react';

export default function Row({ children }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'start',
      margin: '10px 0'
    }}>
      {children}
    </div>
  )
}