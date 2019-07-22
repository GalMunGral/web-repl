import React, { Component, Fragment } from 'react';

export default function History({ history }) {
  return (
    <div className="vertical-center">
    {history.map((entry, i) => (
      <Fragment key={i}>
        <code>{entry.in}</code>
        <code>{entry.out}</code>
      </Fragment>
    ))}
    </div>
  )
}