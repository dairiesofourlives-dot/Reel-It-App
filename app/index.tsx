
import { Redirect } from 'expo-router';

export default function Index() {
  console.log('Index redirecting to splash');
  return <Redirect href="/splash" />;
}
