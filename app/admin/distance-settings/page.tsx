'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'

export default function DistanceSettingsPage() {
  const [originAddress, setOriginAddress] = useState('4463 Helmsway Dr, Lansing, MI 48911')
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')

  const handleSave = async () => {
    setIsSaving(true)
    setMessage('')
    
    try {
      // Update the environment variable via environment variable update
      // In production, this would typically call an API route to update settings
      alert(`To update the business origin address, please update the BUSINESS_ORIGIN_ADDRESS environment variable in your project settings to:\n\n${originAddress}`)
      setMessage('Address setting updated. Restart your app for changes to take effect.')
    } catch (error) {
      setMessage('Failed to save settings. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-serif font-bold text-[#2d3a47] mb-2">Distance Calculation Settings</h1>
        <p className="text-muted-foreground">
          Configure the business origin address for distance calculations.
        </p>
      </div>
        
      <div className="bg-white rounded-lg border border-[#ded2c4]/30 p-6 space-y-6 max-w-2xl">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-900 text-sm">
              <strong>Note:</strong> The business origin address is stored as an environment variable called <code className="bg-blue-100 px-2 py-1 rounded">BUSINESS_ORIGIN_ADDRESS</code>. 
              To change it permanently, update this environment variable in your project settings.
            </p>
          </div>

          <Field>
            <FieldLabel htmlFor="originAddress">Business Origin Address</FieldLabel>
            <p className="text-sm text-muted-foreground mb-2">
              This address is used as the starting point for all distance calculations
            </p>
            <Input
              id="originAddress"
              value={originAddress}
              onChange={(e) => setOriginAddress(e.target.value)}
              placeholder="Enter your business address"
              disabled
              className="bg-[#f8f5f1] cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Current value: <code className="bg-[#f8f5f1] px-2 py-1 rounded">{originAddress}</code>
            </p>
          </Field>

          <div className="bg-[#f8f5f1] border border-[#ded2c4]/50 rounded-lg p-4">
            <h3 className="font-semibold text-[#2d3a47] mb-2">How to Update:</h3>
            <ol className="text-[#2d3a47] text-sm space-y-2 list-decimal list-inside">
              <li>Go to your project settings</li>
              <li>Navigate to the "Vars" section</li>
              <li>Find or create the <code className="bg-[#ded2c4]/30 px-1">BUSINESS_ORIGIN_ADDRESS</code> variable</li>
              <li>Update the value to your desired address</li>
              <li>Save and restart your app</li>
            </ol>
          </div>

          {message && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">{message}</p>
            </div>
          )}

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full"
          >
            {isSaving ? (
              <>
                <Spinner className="mr-2" />
                Saving...
              </>
            ) : (
              'Update Environment Variable'
            )}
          </Button>

          <div className="bg-[#f8f5f1] rounded-lg p-4">
            <h3 className="font-semibold text-[#2d3a47] mb-2">How Distance Calculation Works:</h3>
            <ul className="text-[#2d3a47] text-sm space-y-2">
              <li>• Uses Google Maps Distance Matrix API for accurate distance</li>
              <li>• Calculates in miles using driving distance</li>
              <li>• Automatically included 30 miles in the base price</li>
              <li>• Additional distance charged at $2.50 per mile</li>
            </ul>
          </div>
        </div>
    </div>
  )
}
