import React from 'react';
import PropTypes from 'prop-types';

const Rolecard = (props) => (

<div className="rolecard-inner inner">
	
	<div className="role-info{{#unless intro}} card{{/unless}}">
		
			{/* {{#unless intro}}
				<button id="btn-close-role-card" className="btn" type="submit" name="submit" data-keep_enabled="true">
					{{{cloudinaryUrl '/v1540845195/at-stake/icons/close.svg' height=25}}}
				</button>
			{{/unless}} */}
		
		<h2 className="title">Your role: <b>{props.role.title}</b></h2>
	
	</div>
	
	<div className="description">{props.role.bio.html}</div>

	<div className="agenda-wrap form">

		<div id="needs">
				<h1 className="header">Needs</h1> 

          {
            props.role.needs ?
              <div>
                <div className="agenda-item"><div className="agenda">{props.role.needs[0]}</div></div>
                <span id="div"></span>
                <div className="agenda-item"><div className="agenda">{props.role.needs[1]}</div></div>
              </div>
            :
              <div>      
                <div className="agenda-item"><div className="agenda">Example need 1</div></div>
                <span id="div"></span>
                <div className="agenda-item"><div className="agenda">Example need 2</div></div>
              </div>
          }
		</div>

			
		<h1 className="header"><span className="star">&#9733;</span>Secret Goal<span className="star">&#9733;</span></h1> 
		<div>
      {props.role.secretGoal ? props.role.secretGoal : 'Example goal'}
		</div>
    
    {props.intro ? (

      <button id="btn-role-next" className="btn next-step" type="submit" name="submit" onClick={() => { props.close(); }}>
				Continue
			</button>

    ) : null}

	</div>

</div>

);

Rolecard.propTypes = {
  visible: PropTypes.bool,
  intro: PropTypes.bool,
  close: PropTypes.func
};

export default Rolecard;
