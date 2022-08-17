import React, { useEffect, useState } from 'react';
import { Container } from 'semantic-ui-react';
import { Activity } from '../modules/activity';
import NavBar from './NavBar';
import ActivityDashboard from '../../features/activities/dashboard/ActivityDashboard';
import {v4 as uuid} from 'uuid'
import agent from '../api/agent';
import LoadingComponent from './LoadingComponent';


function App() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [SelectedActivity, SetSelectedActivity] = useState<Activity | undefined>(undefined);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    agent.Activities.List().then(response => {
      let activities: Activity[] = [];
      response.forEach((activity: Activity) => {
      activity.date = activity.date.split('T')[0];
      activities.push(activity);
      
    })
      setActivities(activities);
      setLoading(false);
    })
  }, [])

function handleSelectActivity(id: string){
  SetSelectedActivity(activities.find(x=>x.id === id))
}

function handleCancelSelectActivity(){
  SetSelectedActivity(undefined);
}

function handleFromOpen(id?: string){
  id ? handleSelectActivity(id) : handleCancelSelectActivity();
  setEditMode(true);
}

function handleFromClose(){
  setEditMode(false);
}

function handleCreateOrEditActivity(activity: Activity){
  setSubmitting(true);
  if (activity.id){
    agent.Activities.update(activity).then(()=>{
      setActivities([...activities.filter(x=>x.id !== activity.id),activity]);
      SetSelectedActivity(SelectedActivity);
      setEditMode(false);
      setSubmitting(false);
    })
  } else{
    activity.id = uuid();
    agent.Activities.create(activity).then(()=>{
      setActivities([...activities,activity])
      SetSelectedActivity(SelectedActivity);
      setEditMode(false);
      setSubmitting(false);
    })
  }
}

function handleDeleteActivity(id: string){
  setSubmitting(true);
  agent.Activities.delete(id).then(()=>{
    setActivities([...activities.filter(x=>x.id !== id)])
    setSubmitting(false);
  })
}
if (loading) return <LoadingComponent content='Loading app' />
  return (
    <>
      <NavBar openForm={handleFromOpen} />
      <Container style={{ marginTop: '7em' }}>
        <ActivityDashboard 
        activities={activities} 
        selectedActivity={SelectedActivity}
        selectActivity={handleSelectActivity}
        cancelSelectActivity={handleCancelSelectActivity}
        editMode = {editMode}
        openForm = {handleFromOpen}
        closeForm = {handleFromClose} 
        createOrEdit={handleCreateOrEditActivity}
        deleteActivity = {handleDeleteActivity}
        submitting = {submitting}
        />
      </Container>
    </>
  )
}

export default App;
