/* 
  * COMPONENT: Interstitial screen 
  * @param {Number} phase
  * @param {String} title
*/
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import './Interstitial.scss';

import CdnImage from '../../Util/CdnImage/CdnImage';

class Interstitial extends PureComponent { 
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      visible: true
    };
  }

  componentDidMount() {

    setTimeout(() => {
      this.setState({visible: false});      
    }, 2000);

  }

  render () {
    const visible = this.state.visible;
    const { phase, title } = this.props;

    return (
      <div>

        {visible ?
          <section id="interstitial">
          
          
          <h2>Phase {phase}</h2>
          <h1>{title}</h1>
          {/* <CdnImage publicId="v1540488090/at-stake/bg/interstitial" format="png" /> */}
          
          </section>
          : null
        }
        
      </div>
    );
  }
}

Interstitial.propTypes = {
  phase: PropTypes.number,
  title: PropTypes.string,
};

Interstitial.defaultProps = {
  phase: 0,
  title: 'Title'
};

export default Interstitial;
