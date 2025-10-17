// API submission handler for trust agreement
window.submitTrustAgreement = async function(agreementData) {
  try {
    // Prepare data for API
    const selectedServicesByComponent = {};
    const customServicesByComponent = {};
    
    // Convert selectedServices from flat structure to grouped by component
    Object.keys(agreementData.selectedServices || {}).forEach(key => {
      if (agreementData.selectedServices[key]) {
        const [componentId, serviceIndex] = key.split('_');
        if (!selectedServicesByComponent[componentId]) {
          selectedServicesByComponent[componentId] = [];
        }
        // Find the service name from the component
        const component = agreementData.components?.find(c => c.id === componentId);
        if (component && component.included[serviceIndex]) {
          selectedServicesByComponent[componentId].push(component.included[serviceIndex]);
        }
      }
    });
    
    // Get custom services
    Object.keys(agreementData.additionalServices || {}).forEach(componentId => {
      if (agreementData.additionalServices[componentId]) {
        customServicesByComponent[componentId] = agreementData.additionalServices[componentId];
      }
    });
    
    const payload = {
      selectedUser: agreementData.currentUser || 'unknown',
      selectedComponents: Object.keys(agreementData.selectedComponents || {}).filter(
        key => agreementData.selectedComponents[key]
      ),
      selectedServices: selectedServicesByComponent,
      customServices: customServicesByComponent,
      contactInfo: agreementData.contactInfo || {},
      signatures: agreementData.signatures || {},
      agreementText: agreementData.generatedAgreement || '',
    };
    
    const response = await fetch('/api/trpc/trust.submitAgreement', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to submit agreement');
    }
    
    const result = await response.json();
    
    if (result.result?.data?.success) {
      alert('Agreement submitted successfully! A copy with CSV data and full agreement has been sent to ocasiowillson@protonmail.com');
      return true;
    } else {
      throw new Error('Submission failed');
    }
  } catch (error) {
    console.error('Error submitting agreement:', error);
    alert('Failed to submit agreement. Please try again or contact support.');
    return false;
  }
};
