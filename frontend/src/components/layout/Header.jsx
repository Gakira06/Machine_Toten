import React from 'react'
import Logo from "../../assets/LogoPatelaria.png"

const Header = () => {
  return (
    <header className='flex justify-between p-8 '>
      <div className='flex items-center justify-center gap-6'>
        <img src={Logo} className='w-20 h-20'/>
        <h1 className='text-xl'>Ligue Ligue Pastelaria</h1>
      </div>
      <nav></nav>
    </header>
  )
}

export default Header
