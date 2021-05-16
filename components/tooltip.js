import ReactTooltip from 'react-tooltip'
import { useState, useEffect } from 'react'

const Tooltip = props => {
  useEffect(() => {
    ReactTooltip.rebuild()
  })
  ReactTooltip.rebuild()
  return (
    <ReactTooltip
      {...props}
    />
  )
}

export default Tooltip
