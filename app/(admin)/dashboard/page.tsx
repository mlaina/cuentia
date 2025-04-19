'use client'

import React, { useState } from 'react'
import UsersTab from '@/components/admin/users'
import StoriesTab from '@/components/admin/stories'
import InvitationForm from '@/components/admin/invitationform'
import FeedbackTab from '@/components/admin/feedback'
import ErrorsTab from '@/components/admin/errors'
import RequestsTab from '@/components/admin/requests'

export default function DashboardComponent () {
  const [activeTab, setActiveTab] = useState('users')

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return <UsersTab />
      case 'stories':
        return <StoriesTab />
      case 'feedback':
        return <FeedbackTab />
      case 'errors':
        return <ErrorsTab />
      case 'requests':
        return <RequestsTab />
      default:
        return null
    }
  }

  return (
    <div className='flex background-section-3 min-h-screen pt-20 md:pt-28'>
      <main className='flex-1 w-full px-6'>
        <h1 className='text-3xl font-bold mb-6'>Dashboard de los Dioses</h1>
        <InvitationForm />
        <div className='flex space-x-4 mb-2'>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded ${activeTab === 'users' ? 'bg-secondary text-white' : 'bg-gray-200'}`}
          >
            Usuarios
          </button>
          <button
            onClick={() => setActiveTab('stories')}
            className={`px-4 py-2 rounded ${activeTab === 'stories' ? 'bg-secondary text-white' : 'bg-gray-200'}`}
          >
            Cuentos
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`px-4 py-2 rounded ${activeTab === 'feedback' ? 'bg-secondary text-white' : 'bg-gray-200'}`}
          >
            Feedbacks
          </button>
          <button
            onClick={() => setActiveTab('errors')}
            className={`px-4 py-2 rounded ${activeTab === 'errors' ? 'bg-secondary text-white' : 'bg-gray-200'}`}
          >
            Errores
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded ${activeTab === 'requests' ? 'bg-secondary text-white' : 'bg-gray-200'}`}
          >
            Solicitudes
          </button>
        </div>

        <div className='bg-white rounded shadow p-6'>
          {renderTabContent()}
        </div>
      </main>
    </div>
  )
}
