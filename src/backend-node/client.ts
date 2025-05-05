import { useEffect, useState } from 'react';

interface UserAttributes {
    usermail: string;
    userID: number;
    userName: string;
    userRole: string;
    userRUN: string;
  }

function useJWTBoilerplate(ctx: string): UserAttributes | null {
    const [userAttributes, setUserAttributes] = useState<UserAttributes | null>(null);

    useEffect(() => {
        const verifyToken = async () => {
            if (ctx) {
                try {
                    const response = await fetch('http://localhost:8080/verify', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ token: ctx }),
                    });
                    const tokendata = await response.json();
                    if (tokendata.status === 'success') {
                    setUserAttributes({
                        usermail: tokendata.items.userEmail,
                        userID: tokendata.items.userId,
                        userName: tokendata.items.userName,
                        userRole: tokendata.items.userRole,
                        userRUN: tokendata.items.userRUN
                    });
                }
                } catch (error) {
                    console.error('Token verification failed:', error);
                }
            }
        };

        verifyToken();

    }, [ctx]);

    return userAttributes;
}


export default useJWTBoilerplate;