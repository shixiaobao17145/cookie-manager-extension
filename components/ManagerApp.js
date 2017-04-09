import React from 'react'
import './app.css'
import { Layout, Menu, Breadcrumb } from 'antd';
import { Input } from 'antd';
import CookieTable from './CookieTable';
const { Header, Content, Footer } = Layout;
const Search = Input.Search;

export default class ManagerApp extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			filterKey:''
		}
	}
	updateFilter(e){
		let value = e.target.value;
		this.setState({
			filterKey:value
		});
	}
	render(){
		return (
			<Layout>
				<Header style={{ position: 'fixed', width: '100%' }} className="header">
					<Search placeholder="filter domain" className="cookie-filter" onKeyUp={(e)=>this.updateFilter(e)}/>
				</Header>
				<Content style={{ padding: '0 50px', marginTop: 64 }}>
					<CookieTable filterKey={this.state.filterKey}/>
				</Content>
				<Footer style={{ textAlign: 'center' }}>
					©2016 Created by Bob
				</Footer>
			</Layout>
		)
	}
}
