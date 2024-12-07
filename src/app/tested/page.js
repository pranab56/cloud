import React from 'react';

export default function app ({data}){
    return (
        <div>

        </div>
    )
}

export async function getStaticProps() {
    // Simulating a data fetch
    const data = await fetch('https://jsonplaceholder.typicode.com/users').then((res) =>
      res.json()
    );
  
    return {
      props: { data }, // Pass fetched data to the component
      revalidate: 60, // Revalidate every 60 seconds
    };
  }