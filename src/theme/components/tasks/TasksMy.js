/*
    author: Alexander Zolotov
*/

import React, { Component } from 'react';

import PropTypes from 'prop-types';
import {Link} from 'react-router-dom'

import {Icon} from 'react-fa'

import Countdown from 'react-countdown-now';

import ActionLink from '~/src/components/common/ActionLink'

import ActivityTypes from "~/src/common/ActivityTypes"

import PubSub from 'pubsub-js';

const RenderDummyFriends = false;

/*Helper functions*/
const DayFromNumber = (dayNum)=> {
    const DayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
    return DayNames[dayNum];
  }
  
  const MonthFromNumber = (monthNum)=> {
    const MonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Dec'];
  
    return MonthNames[monthNum];
  }
  
  const GetHangoutPartner = (hangout, props) => {
    let Partner = hangout.metaData.participants.find(function(participant) {
      return participant.user._id != props.currentUserID;
    });
  
    return Partner;
  }
  
  const GetFirstPendingParticipant = (hangout, props) => {
    const FirstPendingParticipant = hangout.metaData.participants.find(function(participant){
      return participant.status == "pending";
    });
  
    return FirstPendingParticipant;
  }
  
  const FirstAcceptedParticipants = (hangout, props) => {
    const FirstAcceptedParticipant = hangout.metaData.participants.find(function(participant){
      return participant.user._id != props.currentUserID && participant.status == "accepted";
    });
  
    return FirstAcceptedParticipant;
  }
  
  const GetCurrentUserAsParticipant = (hangout, props) => {
    return hangout.metaData.participants.find(function(participant){
      return participant.user._id == props.currentUserID;
    });
  }
  
  const Hours12 = (date) => { return (date.getHours() + 24) % 12 || 12; }
  
  const GenerateDateString = (time, props) => {
    const DateFromTime = new Date(time);
    
    const Noon = new Date(DateFromTime.getFullYear(), 
                          DateFromTime.getMonth(),
                          DateFromTime.getDate()
                          , 12, 0, 0);
  
    const AmPm = (DateFromTime.getTime() < Noon.getTime()) ? 'am' : 'pm';
  
    const Hours = String(Hours12(DateFromTime)) + AmPm;
  
    const CurrentDate = new Date;
  
    const Today = new Date();
    const Tomorrow = new Date(Today.getTime() + 24 * 60 * 60 * 1000);
    const AfterTomorrow = new Date(Tomorrow.getTime() + 24 * 60 * 60 * 1000);
    const ThisSunday = new Date(CurrentDate.setDate(CurrentDate.getDate() - CurrentDate.getDay() + 6));
  
    let DateString = "";
    
    if (DateFromTime.getFullYear() == Today.getFullYear() 
        && DateFromTime.getMonth() == Today.getMonth() 
          && DateFromTime.getDate() == Today.getDate()) {
      DateString = ` today at ${Hours}`;
    }
    else if (DateFromTime.getFullYear() == Tomorrow.getFullYear() 
              && DateFromTime.getMonth() == Tomorrow.getMonth() 
                && DateFromTime.getDate() == Tomorrow.getDate()) {
      DateString = ` tomorrow at ${Hours}`;
    }
    else if (DateFromTime.getFullYear() == ThisSunday.getFullYear() 
               && DateFromTime.getMonth() == ThisSunday.getMonth() && DateFromTime.getDate() <= ThisSunday.getDate()) {
      DateString = ` on ${DayFromNumber(DateFromTime.getDay())} at ${Hours}`;
    }
    else {
      DateString = `${DateFromTime.getDate()} ${MonthFromNumber(DateFromTime.getMonth())} at ${Hours}`;
    }
    
    return DateString;
  }

  const RenderIlluminateActions = (task, props) => {
    switch (task.status) {
      case "None": {
        return (
          <div className="deep-tools">
            <ul>
              <li>
                <ActionLink href="#"
                  onClick={()=>props.onHangoutActionPerform("answer_questions", task)} className="btn-base btn-red">
                  Answer Questions
                </ActionLink>
              </li>
            </ul>
         </div>);
      }
      case "complete": {
        return (
          <div className="deep-tools">
          </div>
        );
      }
    }

  }

  const openChat = (partner) => {
    const chatBoxElemet = document.getElementById(partner.user_id);

    if(chatBoxElemet) {
      chatBoxElemet.click();
    } else {
      PubSub.publish('OpenChat', partner);
    }
  }

  const RenderActions = (hangout, props) => {
    const Partner = GetHangoutPartner(hangout, props);
    const FirstPendingParticipant = GetFirstPendingParticipant(hangout, props);
    const FirstAcceptedParticipant = FirstAcceptedParticipants(hangout, props);

    const TimeHasCome = props.timeNow >= hangout.metaData.time;

    const ButtonStartText = !TimeHasCome ? <span><span>Start </span><Countdown date={hangout.metaData.time}/></span> : <span>Start</span>;

    const StartDisabled = !TimeHasCome;
  
    switch (hangout.status) {
      case "complete": {
        return (
          <div className="deep-tools">
          </div>
        );
      }
      case "finished": {
        if (hangout.metaData.ratings.findIndex(function(rating) {
          return rating.fromUser == props.currentUserID && rating.toUser == Partner.user._id; }) == -1) {
            return (
              <div className="deep-tools">
                <ul>
                  <li>
                    <ActionLink href="#" onClick={()=>props.onHangoutRate(hangout, Partner.user._id, "good")} className="btn-base btn-red">Good</ActionLink>
                  </li>
                  <li>
                    <ActionLink href="#" onClick={()=>props.onHangoutRate(hangout, Partner.user._id, "bad")} className="btn-base btn-red">Bad</ActionLink>
                  </li>
                </ul>
             </div>);
        }
        else {
          return (
            <div className="deep-tools">
              <span>Waiting partner's feedback</span>
            </div>);
        }
      }
      case "None": {
        if (hangout.creator._id == props.currentUserID) {
          if (FirstAcceptedParticipant) {
            return (
                <div className="deep-tools">
                  <ul>
                    <li>
                      <ActionLink href="#" onClick={()=>props.onHangoutActionPerform("reschedule", hangout)} className="btn-base btn-red">Reschedule</ActionLink>
                    </li>
                    <li>
                      <ActionLink href="#" onClick={()=>props.onHangoutActionPerform("cancel", hangout)} className="btn-base btn-red">Cancel</ActionLink>
                    </li>
                    <li>
                      <ActionLink href="#" disabled={StartDisabled} 
                        onClick={()=>props.onHangoutActionPerform("start", hangout)} className={StartDisabled ? "btn-base btn-red disabled" : "btn-base btn-red "}>
                        {ButtonStartText}
                      </ActionLink>
                    </li>
                  </ul>
               </div>);
            
          }
          else if (FirstPendingParticipant) {
            return (
                <div className="deep-tools">
                  <ul>
                    <li>
                      <ActionLink href="#" onClick={()=>props.onHangoutRequestAccept(hangout, FirstPendingParticipant.user)} className="btn-base btn-red">Accept</ActionLink>
                    </li>
                    <li>
                      <ActionLink href="#" onClick={()=>{openChat(Partner)}} className="btn-base btn-red">Open Chat</ActionLink>
                    </li>
                    <li>
                      <ActionLink href="#" onClick={()=>props.onHangoutRequestReject(hangout, FirstPendingParticipant.user)} className="btn-base btn-red">Reject</ActionLink>
                    </li>
                  </ul>
               </div>);
          }
          else {
            return (
                <div className="deep-tools">
                <ul>
                  <li>
                    <ActionLink href="#" onClick={()=>props.onHangoutActionPerform("reschedule", hangout)} className="btn-base btn-red">Reschedule</ActionLink>
                  </li>
                  <li>
                    <ActionLink href="#" onClick={()=>props.onHangoutActionPerform("cancel", hangout)} className="btn-base btn-red">Cancel</ActionLink>
                  </li>
                </ul>
             </div>);
          }
      }
      else {
        return (
            <div className="deep-tools">
              <ul>
                <li>
                  <ActionLink href="#" onClick={()=>props.onHangoutActionPerform("leave", hangout)} className="btn-base btn-red">Withdraw</ActionLink>
                </li>
                <li>
                  <ActionLink href="#" onClick={()=>{openChat(Partner)}} className="btn-base btn-red">Open Chat</ActionLink>
                </li>
              </ul>
           </div>);
      }
    }
    case "started": {
      return (
        <div className="deep-tools">
          <ul>
            <li>
              <ActionLink href="#" onClick={()=>props.onHangoutActionPerform("reschedule", hangout)} className="btn-base btn-red">Reschedule</ActionLink>
            </li>
            <li>
              <ActionLink href="#" onClick={()=>props.onHangoutActionPerform("cancel", hangout)} className="btn-base btn-red">Cancel</ActionLink>
            </li>
            <li>
              <ActionLink href="#"
                onClick={()=>props.onHangoutActionPerform("answer_questions", hangout)} className="btn-base btn-red">
                Answer Questions
              </ActionLink>
            </li>
          </ul>
       </div>);
    }
    case "cancelled":
    case "canceled": {
      if (hangout.creator._id != props.currentUserID) {
        return (
            <div className="deep-tools">
              <ul>
                <li>
                  <ActionLink href="#" onClick={()=>props.onHangoutActionPerform("leave", hangout)} className="btn-base btn-red">Withdraw</ActionLink>
                </li>
                <li>
                  <ActionLink href="#" onClick={()=>{openChat(Partner)}} className="btn-base btn-red">Open Chat</ActionLink>
                </li>
              </ul>
           </div>);
      }
      else {
        return (
          <div className="deep-tools">
          </div>
        );
      }
    }
    default: {
      return (
        <div className="deep-tools">
        </div>
      );
    }
   }
  }

  const IlluminateTitleFromStatus = (task) => {
    let result = <h4> <a href="#" className="link-black"></a> </h4>
    switch (task.status) {
      case "started":
        result = (
          <h4>Illuminate is in progress</h4>
        )
        break;
      case "finished": {
        result = (
            <h4>Illuminate is finished</h4>
          );
        break;
      }
      case "complete": {
        result = (
          <h4>Illuminate is complete</h4>
          );
        break;
      }
      default: {
        result = (
          <h4>Illuminate is progress</h4>
          );
        break;
      }
    }

    return result;
  }

  const HangoutTitleFromStatus = (task, Partner) => {
    let result = <h4> <a href="#" className="link-black"></a> </h4>
  
    if (!Partner) {
      switch (task.status) {
        case "canceled":
        case "cancelled": {
          result = (
            <h4>Your Deepdive has been cancelled</h4>
            );
          break;
        }
        case "started": {
          result = (
              <h4>Your Deepdive is in progress</h4>
            );
          break;
        }
        case "finished": {
          result = (
              <h4>Your Deepdive is finished</h4>
            );
          break;
        }
        case "complete": {
          result = (
            <h4>Your Deepdive is complete</h4>
            );
          break;
        }
        default: {
            result = (
              <h4>Your Deepdive has no any mets yet</h4>
              );
            break;
        }
      } 
    }
    else {
      switch (task.status) {
        case "canceled":
        case "cancelled": {
          result = ( <h4>Deepdive with <a href="#" className="link-black">{Partner.user.firstName}</a> has been cancelled</h4>
            );
          break;
        }
        case "started": {
            result = ( <h4>Deepdive with <a href="#" className="link-black">{Partner.user.firstName}</a> is in progress</h4>
            );
          break;
        }
        case "finished": {
            result = ( <h4>Deepdive with <a href="#" className="link-black">{Partner.user.firstName}</a> is finished</h4>
            );
          break;
        }
        case "complete": {
            result = ( <h4>Deepdive with <a href="#" className="link-black">{Partner.user.firstName}</a> is complete</h4>
           );
          break;
        }
        default: {
          if (Partner.status == "accepted") {
              result = ( <h4>Confirmed Deepdive with <a href="#" className="link-black">{Partner.user.firstName}</a></h4>
           );
          }
          else if (Partner.status == "pending") {
            result = ( <h4><a href="#" className="link-black">{Partner.user.firstName} </a>{` wants to join your "${task.metaData.subject.skill.name}" Deepdive`}</h4>);
          }
          break;
        }
      }
    }
  
    return result;
  }

  const RenderTaskTitle = (task, props) => {
    let result = <h4><a href="#" className="link-black"></a></h4>
  
    if (task.type == "hangout") {
      const Partner = GetHangoutPartner(task, props);
  
      //Current user has created this hangout
      if (task.creator._id == props.currentUserID) {
        result = HangoutTitleFromStatus(task, Partner);
      }
      else {
        const CurrentUserAsParticipant = GetCurrentUserAsParticipant(task, props);
  
        //Why is this possible???
        if (!CurrentUserAsParticipant) {
          console.log("%c!CurrentUserAsParticipant", "color:red;background:green;");
          result = <h4><a href="#" className="link-black"></a></h4>
        }
        else {
          //for Sent Requests
          switch (CurrentUserAsParticipant.status) {
            case "pending": {
              result = (
                <h4>Your request to Deepdive with <a href="#" className="link-black">{Partner.user.firstName}</a> is pending approval</h4>
              );
              break;
            }
            case "rejected": {
              result = (
                <h4><a href="#" className="link-black">{Partner.user.firstName}</a> has not confirmed your request to join theirs Deepdive</h4>
              );
              break;
            }
            default: {
              //request 'accepted'
              result = HangoutTitleFromStatus(task, Partner);
              break;
            }
          }
        }
      }
    }
    else if (task.type === "illuminate") {
      result = IlluminateTitleFromStatus(task);
    }
    else {
      result = <div id="title">{task.name}</div>;
    }
  
    return result;
  }
  
  const RenderTask = (task, i, props) => {
    const DebugOutputClick = (task) => {
      console.log("Clicked task: ");
  
      let taskCopy = Object.assign({}, task);
      if (taskCopy.metaData.time) {
        taskCopy.dateHangoutShouldStart = new Date(taskCopy.metaData.time);
      }
  
      if (taskCopy.timeStatusChanged) {
        taskCopy.dateHangoutStatusChanged = new Date(taskCopy.timeStatusChanged);
      }
  
      console.dir(taskCopy);
    };
  
    const TaskColClass = props.isCollapsed ? "col-lg-12" : "col-lg-4";
  
    if (task.type == "hangout") {
      const taskTime = task.status == "None" ? task.metaData.time : task.timeStatusChanged;
      
  
      const SecondLine = `Skill: ${task.metaData.subject.skill.name}`;
      const ThirdLine = `Time: ${GenerateDateString(taskTime, props)}`

      return (
        <div className="col-deep col-sm-6" key={i}>
        <div className="item-deep">
        <div className="deep-content">
            {RenderTaskTitle(task, props)}
            <p onClick={()=>DebugOutputClick(task)}>{SecondLine}</p>
            <p>{ThirdLine}</p>
        </div>
        {RenderActions(task, props)}
    </div>
    </div>)
    } else if (task.type === "illuminate"){
      const SecondLine = `Skill: ${task.metaData.subject.skill.name}`;

      return (
        <div className="col-deep col-sm-6" key={i}>
          <div className="item-deep">
            <div className="deep-content">
                {RenderTaskTitle(task, props)}
                <p>{SecondLine}</p>
            </div>
            {RenderIlluminateActions(task, props)}
          </div>
        </div>
      );
    }
  
    return (
      <div className={TaskColClass} key={i}>
          <div className="my-tasks-task">
            {RenderTaskTitle(task, props)}
            <div id="description" onClick={()=>DebugOutputClick(task)}>{task.description}</div>
          </div>
        </div>
    )
  }
  
  const RenderTasks = (props) => {
    if (!props.tasks || props.tasks.length == 0) {
        return null;
    }
    
    return (
        props.tasks.map((task, i) => {
            return RenderTask(task, i, props)
           })
    );
  }

class TasksMy extends React.Component {

  constructor(props) {
    super(props);
  }

  renderTasks() {
      if (!this.props.tasks || this.props.tasks.length == 0) {
          return null;
      }
      

      return this.props.tasks.map(function(task, i) {
          return (
            <div className="col-deep col-sm-6" key={i}>
            <div className="item-deep">
            <div className="deep-content">
                <h4>Comfirmed Deepdive with <a href="#" className="link-black">Alexander</a></h4>
                <p>{`Skill: ${task.name}`}</p>
                <p>Time: Tomorrow, 1am</p>
            </div>
            <div className="deep-tools">
                <ul>
                    <li><a href="#" className="btn-base btn-red">Reschedule</a></li>
                    <li><a href="#" className="btn-base btn-red">Cancel</a></li>
                    <li><a href="#" className="btn-base btn-red disabled">Start</a></li>
                </ul>
            </div>
        </div>
        </div>
          )
      });
  }

  render() {
    return (<div className="scrollbar-inner">
    <div className="block-deepdive">
        <div className="row">
            {RenderTasks(this.props)}
        </div>
    </div>
</div>
    );
  }
}

TasksMy.propTypes = {
}

export default TasksMy;