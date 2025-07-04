// Remove all the existing imports for session functions
// And use just one clean import
import { openTableSession } from '../services/sessionService';

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    // Use openTableSession directly
    const session = await openTableSession(tableNumber);
    
    // Rest of your code
  } catch (error) {
    console.error('Error starting session:', error);
    // Handle error
  }
};