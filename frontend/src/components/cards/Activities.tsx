import React from 'react';

interface IAct {
    activities: any;
    today: boolean;
}

const Activities: React.FC<IAct> = ({activities, today}) => {
    let Acts = null;
    let addBtn = null;

    if (today && activities.length === 0) {
        Acts = (
            <div className="container">
                <div className="row justify-content-center">
                    <p>You have not done any activities today!</p>
                </div>
                <div className="row justify-content-center">
                    <button type="button" className="btn btn-primary">
                        Add one now!
                    </button>
                </div>
            </div>
        );
    } else {
        Acts = activities.map((act: any) => (
            <div className="row justify-content-content" style={{paddingBottom: '10px'}}>
                    <div className="card" style={{width: '45rem'}}>
                        <h6 className="card-title">Activity</h6>
                    </div>
                </div>
        ));
    }

    return <div className="row justify-content-center">{Acts}</div>;
};

export default Activities;
